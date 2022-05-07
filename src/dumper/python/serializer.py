from collections import deque
import json

bigint = 1 << 53  # 53 is Javascript Max Int size
escape_float = [float("INF"), -float("INF"), float("NaN")]
list_container_types = [list, tuple, range,  deque]
ignore_types = ["module", "function", "type"]

ignore_result = '{{"dataType":"ignored","typeName":"{}","reason":"{}"}}'
bigint_result = '{{"typeName":"bigint","dataType":"escaped","data":{}}}'
float_escape_result = '{{"typeName":"float","dataType":"escaped","data":"{}"}}'
primitive_result = '{{"dataType":"primitive","typeName":"{}","data":{}}}'
ref_result = '{{"dataType":"reference","data":{}}}'
list_header = '{{"dataType":"list","typeName":"{}","data":['
dict_header = '{{"dataType":"dict","typeName":"{}","data":{{'


class Comma():
    pass


class Coron():
    pass


class ListFooter():
    pass


class DictFooter():
    pass


class DictKey():
    pass


commna = Comma()
coron = Coron()
list_footer = ListFooter()
dict_footer = DictFooter()
dict_key = DictKey()


def serialize(val, size_limit):
    ids = set()
    result = []
    stack = [val]
    while stack:
        target = stack.pop()
        target_type = type(target)
        type_name = target_type.__name__

        if target_type == Comma:
            result.append(",")
        elif target_type == Coron:
            result.append(":")
        elif target_type == DictKey:
            key = stack.pop()
            if type(key) == str:
                key = json.dumps(json.dumps(key))
                result.append(key)
            else:
                result.append('"{}"'.format(key))
        elif target_type == int:
            if target >= bigint:
                result.append(bigint_result.format(str(target)))
            else:
                result.append(str(target))
        elif target_type == str:
            if len(target) > size_limit:
                result.append(ignore_result.format(type_name, "huge"))
                continue
            result.append(json.dumps(target))
        elif target_type == bool:
            data = "true" if target else "false"
            result.append(data)
        elif type_name in ignore_types:
            result.append(ignore_result.format(type_name, "not target"))
        elif target is None:
            result.append("null")
        elif target_type == ListFooter:
            result.append("]}")
        elif target_type == DictFooter:
            result.append("}}")

        elif target_type == float:
            if target in escape_float:
                result.append(float_escape_result.format(str(target)))
            else:
                result.append(str(target))
        else:
            target_id = id(target)
            if target_id in ids:
                result.append(ref_result.format(target_id))
                continue
            ids.add(target_id)
            if target_type in list_container_types \
                    or target_type.__base__ in list_container_types:
                if len(target) > size_limit:
                    result.append(ignore_result.format(type_name, "huge"))
                    continue
                result.append(list_header.format(type_name))
                stack.append(list_footer)
                for child in reversed(target):
                    stack.extend((
                        child,
                        commna
                    ))
                if stack[-1] == commna:
                    stack.pop()
            elif target_type == set or target_type.__base__ == set:
                if len(target) > size_limit:
                    result.append(ignore_result.format(type_name, "huge"))
                    continue
                result.append(list_header.format(type_name))
                stack.append(list_footer)
                for child in target:
                    stack.extend((
                        child,
                        commna
                    ))
                if stack[-1] == commna:
                    stack.pop()
            elif target_type == dict or target_type.__base__ == dict:
                if len(target) > size_limit:
                    result.append(ignore_result.format(type_name, "huge"))
                    continue
                result.append(dict_header.format(type_name))
                stack.append(dict_footer)
                for k, v in target.items():
                    stack.extend((
                        v,
                        coron,
                        k,
                        dict_key,
                        commna
                    ))
                if stack[-1] == commna:
                    stack.pop()
            elif hasattr(target, '__dict__'):
                result.append(dict_header.format(type_name))
                stack.append(dict_footer)
                for k, v in vars(target).items():
                    if callable(v):
                        continue
                    stack.extend((
                        v,
                        coron,
                        k,
                        dict_key,
                        commna
                    ))
                if stack[-1] == commna:
                    stack.pop()
            else:
                result.append(ignore_result.format(type_name, "unsupported"))

    return "".join(result)
