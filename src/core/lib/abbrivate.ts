import { Value, isPrimitive, makeValueText } from "../entity/value";

const threshold = 30

export const abbrivateValue = (target: Value): Value => {
    if (isPrimitive(target)) {
        return target
    }
    let children: typeof target.children = {}
    for (const [key, child] of Object.entries(target.children)) {
        children[key] = {
            keyExpression: child.keyExpression,
            value: abbrivateValue(child.value)
        }
    }
    const valueLen = target.expression.length
    if (valueLen < threshold) {
        return {
            ...target,
            children
        }
    }
    const abbrivatedExpression = [
        target.expression[0]!,
        makeValueText("..."),
        target.expression[valueLen - 1]!
    ]
    return {
        ...target,
        children,
        expression: abbrivatedExpression
    }
}