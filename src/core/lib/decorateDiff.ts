import { Value, isEqual, isPrimitive } from "../entity/value"


const setNew = (target: Value) => {
    for (const txt of target.expression) {
        txt.isNew = true
    }
}

const setChanged = (target: Value) => {
    for (const txt of target.expression) {
        txt.isChanged = true
    }
}

export const decorateDiff = (target: Value, compare: Value | undefined) => {
    if (compare === undefined) {
        setNew(target)
        return
    }
    if (target.type !== compare.type) {
        setChanged(target)
        return
    }
    if (isPrimitive(target)) {
        if (!isEqual(target, compare)) {
            setChanged(target)
        }
        return
    }

    if (target.isSet) {
        // (hash)set elem can have different key
        for (const child of Object.values(target.children)) {
            if (Object.values(compare.children).some(x => isEqual(x.value, child.value))) {
                continue
            }
            setNew(child.value)
        }
        return
    }
    for (const [i, child] of Object.entries(target.children)) {
        decorateDiff(child.value, compare.children[i]?.value)
    }
}