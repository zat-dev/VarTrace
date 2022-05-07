from collections import deque


dic_mod = {"a": 1}
dic_mod["a"] = 2
dic_add = {"a": 1}
dic_add[3] = 2
list_add = [1]
list_add.append(2)
list_mod = [1, 2]
list_mod[1] = 3
list_del = [1, 2]
list_del.pop()
nest = {"a": {"c": "d"}, "b": [1, 2], "c": set([1, 2])}

rec = []
rec.append(rec)

x = range(3)
y = map(str, [1, 2, 3])
x = tuple(x)


class TestClass:
    def __init__(self):
        self.x = 1


test_class = TestClass()

longlonglonglonglonglongstring = "long"*100

longlong_dic = {
    "longlonglonglonglonglongstring": "long"*100,
    "longlonglonglonglonglongstring2": "long"*100
}

ignored_by_huge = [0] * 1000

inf = float("inf")

tbl = [[1, 2, 4], [5, 5, 7]]

dic_tbl = {"a": {"b": 1, "c": 4}, "d": {"x": 6}}

table3d = [[[1], [2, 3]], [[4, 5]], [[6]]]
table3d[1][0][1] = 9
table3d[1][0][0] = 7

queue = deque([1, 2, 3])
queue.popleft()
