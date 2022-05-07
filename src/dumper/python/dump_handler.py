from collections import defaultdict
import copy
from msilib.schema import Error
import os
import sys
import json
import ast
from serializer import serialize
from sqlite_saver import SqliteSaver

version = "0.0.1"


class DumpHandler():
    __module__ = "VarTrace"

    def __init__(self, config):
        self.config = config
        self.target_variables_dic = {}
        self.file_ids = {}
        self.saver = SqliteSaver(config.out_file)
        self.step = 0
        self.var_id = 0
        self.last_scope_id = 0
        self.local_scope_id_stack = []
        self.global_scope_ids = {}
        self.function_ids = {}
        self.this_script_dir = os.path.dirname(__file__)
        # var_id_dic[scope_id][var_name] := var_id
        self.var_id_dic = defaultdict(dict)
        # var_id -> val
        self.prev_serialized_variables = defaultdict(lambda: None)
        self.__init_save_data()

    def __proc_file(self, file_path):
        if file_path in self.file_ids:
            return
        file_id = len(self.file_ids)
        self.file_ids[file_path] = file_id
        self.target_variables_dic[file_path] = self.__extract_var_names(
            file_path)
        mod_timestamp = os.path.getmtime(file_path)
        self.saver.save_file(
            file_id, os.path.abspath(file_path), int(mod_timestamp))

    def __is_target_file(self, file_path):
        for dir_path in self.config.dirs:
            if dir_path == os.path.commonpath(dir_path, file_path):
                return True
        return False

    def __is_target_module(self, module_name: str):
        if module_name == None:
            return False
        for target in self.config.target_modules:
            if module_name.startswith(target):
                return True
        return False

    def __is_target(self, file_path, module_name):
        if file_path.startswith(self.this_script_dir):
            return False
        if file_path == "<string>":
            return False
        return self.__is_target_module(module_name) or self.__is_target_file(file_path)

    def __init_save_data(self):
        self.saver.init_metadata(version)

    def __extract_var_names(self, file_name):
        with open(file_name, encoding="utf-8") as file:
            source = file.read()
        var_names = set()
        source_ast = ast.parse(source, type_comments=True)
        for node in ast.walk(source_ast):
            if not isinstance(node, ast.Name):
                continue
            var_names.add(node.id)
        return var_names

    def __proc_func(self, function_name):
        if function_name in self.function_ids:
            return
        function_id = len(self.function_ids)
        self.function_ids[function_name] = function_id
        self.saver.save_function(function_id, function_name)

    def __proc_var_id(self, scope_id, var_name):
        if var_name in self.var_id_dic[scope_id]:
            return
        self.saver.save_variable(
            self.var_id, var_name, self.step, scope_id)
        self.var_id_dic[scope_id][var_name] = self.var_id
        self.var_id += 1

    def __get_var_id(self, scope_id, var_name):
        self.__proc_var_id(scope_id, var_name)
        return self.var_id_dic[scope_id][var_name]

    def __proc_step_info(self, frame, step_kind, return_val):
        file_path = frame.f_code.co_filename
        function_name = frame.f_code.co_name
        module_name = frame.f_globals["__name__"]
        local_scope_id = self.local_scope_id_stack[-1]

        global_scope_id = self.global_scope_ids[module_name]

        self.saver.update_max_step(self.step)

        file_id = self.file_ids[file_path]
        function_id = self.function_ids[function_name]
        serialized_return = None
        if step_kind == "exception" or step_kind == "return":
            serialized_return = serialize(return_val, self.config.size_limit)

        self.saver.save_step(
            self.step,
            step_kind,
            file_id,
            frame.f_lineno,
            function_id,
            serialized_return,
            local_scope_id,
            global_scope_id)

    def __new_local(self, scope_name):
        self.last_scope_id += 1
        self.local_scope_id_stack.append(self.last_scope_id)
        self.saver.save_scope(
            self.last_scope_id, scope_name, "local", self.step, None)

    def __end_local(self):
        scope_id = self.local_scope_id_stack.pop()
        self.saver.update_scope(scope_id, self.step-1)

    def __new_global(self, module_name):
        if not module_name in self.global_scope_ids:
            self.last_scope_id += 1
            self.global_scope_ids[module_name] = self.last_scope_id
            self.saver.save_scope(
                self.last_scope_id, module_name, "global", self.step, None)

    def __is_local_not_global(self, function_name):
        return function_name != "<module>"

    def __proc_new_scope(self, step_kind, function_name, module_name):
        self.__new_global(module_name)
        if step_kind != "call":
            return

        if self.__is_local_not_global(function_name):
            self.__new_local(function_name)
        else:
            global_id = self.global_scope_ids[module_name]
            self.local_scope_id_stack.append(global_id)

    def __dump_scope_vars(self, scope_id, variables, target_var_names):
        serialized_variables = []
        for var_name, raw_val in variables:
            if var_name not in target_var_names:
                continue
            var_id = self.__get_var_id(scope_id, var_name)
            serialized = serialize(raw_val, self.config.size_limit)
            prev_serialized = self.prev_serialized_variables[var_id]
            serialized_variables.append(
                (self.step, var_id, serialized, prev_serialized))
            self.prev_serialized_variables[var_id] = serialized
        self.saver.save_variable_values(serialized_variables)

    def __proc_vars(self, frame, file_name, module_name):
        local_scope_id = self.local_scope_id_stack[-1]
        global_scope_id = self.global_scope_ids[module_name]

        target_var_names = self.target_variables_dic[file_name]

        self.__dump_scope_vars(
            local_scope_id, frame.f_locals.items(), target_var_names)

        if local_scope_id == global_scope_id:
            return
        self.__dump_scope_vars(
            global_scope_id, frame.f_globals.items(), target_var_names)

    def __proc_end_scope(self, step_kind, function_name):
        if step_kind == "return" and self.__is_local_not_global(function_name):
            self.__end_local()

    def dump(self, step_kind, frame, return_val=None):
        file_path = frame.f_code.co_filename
        function_name = frame.f_code.co_name
        module_name = frame.f_globals["__name__"]

        if not self.__is_target(file_path, module_name):
            return

        if self.step > self.config.step_limit:
            print("stop by vartrace: step_limit exceeded", file=sys.stderr)
            exit(1)

        self.__proc_new_scope(step_kind, function_name, module_name)
        self.__proc_file(file_path)
        self.__proc_func(function_name)
        self.__proc_step_info(frame, step_kind, return_val)
        self.__proc_vars(frame, file_path, module_name)
        self.saver.flush()
        self.__proc_end_scope(step_kind, function_name)

        self.step += 1

    def finish(self, reason):
        while self.local_scope_id_stack:
            scope_id = self.local_scope_id_stack.pop()
            self.saver.update_scope(scope_id, self.step)
        for _, scope_id in self.global_scope_ids.items():
            self.saver.update_scope(scope_id, self.step)
        self.saver.update_scope(0, self.step)

        self.saver.finish()
