
def collatz(a):
    if a == 1:
        return
    elif a % 2 == 0:
        collatz(a//2)
    else:
        collatz((3*a+1)//2)


collatz(10001)
