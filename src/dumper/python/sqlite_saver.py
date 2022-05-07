import os
import sqlite3


class SqliteSaver():
    this_script_dir = os.path.dirname(__file__)
    init_sql_file = os.path.join(
        this_script_dir, "../create_tracelog_table.sql")
    base_path = os.getcwd()

    def __init__(self, target_file):
        self.con = sqlite3.connect(target_file)
        self.cursor = self.con.cursor()
        with open(self.init_sql_file) as sql_file:
            init_sql = sql_file.read()
            self.cursor.executescript(init_sql)

    def init_metadata(self, version):
        self.cursor.execute(
            'INSERT INTO metadata VALUES (?, ?, ?, 0, ?)', (version, "python", "running", self.base_path))
        self.flush()

    def update_max_step(self, step):
        self.cursor.execute(
            'UPDATE metadata SET max_step = ? WHERE language = "python"', (step, ))

    def save_file(self, file_id, file_abs_path, mod_timestamp):
        self.cursor.execute(
            'INSERT INTO files VALUES (?, ?, ?)', (file_id, file_abs_path, mod_timestamp))

    def save_function(self, function_id, function_name):
        self.cursor.execute(
            'INSERT INTO functions VALUES (?, ?)', (function_id, function_name))

    def save_step(self, step, step_kind, file_id, line, function_id, return_snap, local_scope_id, global_scope_id):
        self.cursor.execute(
            'INSERT INTO steps VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (step, step_kind, file_id, line, function_id,
             return_snap, local_scope_id, global_scope_id)
        )

    def save_variable(self, var_id, var_name, defined_step, scope_id):
        self.cursor.execute(
            'INSERT INTO variables VALUES (?, ?, ?, ?)', (var_id, var_name, defined_step, scope_id))

    def save_scope(self, scope_id, scope_name, scope_kind, start, end):
        self.cursor.execute(
            'INSERT INTO scopes VALUES (?, ?, ?, ?, ?)', (scope_id, scope_name, scope_kind, start, end))

    def update_scope(self, scope_id, end):
        self.cursor.execute(
            'UPDATE scopes SET end = ? WHERE scope_id = ?', (end, scope_id))

    def save_variable_values(self, variable_values):
        self.cursor.executemany(
            'INSERT INTO variable_values VALUES (?, ?, ?, ?)', variable_values)

    def flush(self):
        self.con.commit()

    def finish(self):
        self.cursor.execute(
            'UPDATE metadata SET status = ? WHERE language = "python"', ("completed", ))
        self.con.commit()
        self.con.close()
