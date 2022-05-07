


export type ValueText = {
    isNew?: boolean, // undefined means false
    isChanged?: boolean, // undefined means false
    // half-open intervals: end is exclusive
    hit: { start: number, end: number }[],
    text: string,
}

export const isPrimitive = (value: Value) => {
    for (let _ in value.children) { return false }
    return true
}

export const isEqual = (value1: Value, value2: Value) => {
    if (value1.expression.length !== value2.expression.length) {
        return false
    }
    return value1.expression.every((v, i) => value2.expression[i]?.text == v.text)
}

export const makeValueText = (text: string): ValueText => ({
    hit: [],
    text,
})

// because of performance reason,
// parent and children value should be the same instance
// in order to parent hit annotation sync to children
export type Value = {
    expression: ValueText[],
    children: {
        [key: string]: {
            keyExpression: ValueText[],
            value: Value
        }
    },
    type: string,
    isSet?: boolean, // undefined means false
    hasHit?: boolean, // undefined means false
    ignoredBy?: string // reason for ignored value
}

export const stringify = (value: Value) => {
    return value.expression.map(({ text }) => text).join("")
}
