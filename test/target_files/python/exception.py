
x = 1
try:
    x = 3
    raise NotImplementedError("should be caught")
except Exception as e:
    y = str(e)

x = 2

if x == 2:
    raise NotImplementedError("should be uncaught")

y = "never arrive here"
