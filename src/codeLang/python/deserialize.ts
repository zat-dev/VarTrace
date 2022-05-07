import { Value } from '../../core';
import { makeValueText } from '../../core/entity/value';
import { isContainer, isIgnored, isPrimitive, Val } from './variableValue';
type Syntax = {
    prefix: string,
    suffix: string,
    sep: string,
    keyValueSep?: string
}

const getSyntax = (typeName: string): Syntax => {
    switch (typeName) {
        case "list": return { prefix: "[", suffix: "]", sep: ", " }
        case "tuple": return { prefix: "(", suffix: ")", sep: ", " }
        case "set": return { prefix: "{", suffix: "}", sep: ", " }
        case "dict": return { prefix: "{", suffix: "}", sep: ", ", keyValueSep: ": " }
    }
    return { prefix: `${typeName}(`, suffix: ")", sep: ", " }
}

const concatChildren = (typeName: string, children: string[]) => {
    const { prefix, suffix, sep } = getSyntax(typeName)
    const content = children.join(sep)
    return `${prefix}${content}${suffix}`
}


export const stringifyVal = (val: Val): string => {
    if (val === null) {
        return "None"
    }
    if (isPrimitive(val)) {
        return JSON.stringify(val)
    }
    switch (val.dataType) {
        case "list":
        case "set": {
            const children = val.data.map((v, _i) => stringifyVal(v))
            const typeName = val.typeName
            return concatChildren(typeName, children)
        }
        case "dict": {
            const typeName = val.typeName
            const children =
                Object.entries(val.data)
                    .map(([key, v]) => `${key}: ${stringifyVal(v)}`)
            return concatChildren(typeName, children)
        }
        case "reference": {
            return `ignored(circular ref)`
        }
        case "escaped": {
            return val.data
        }
        case "ignored":
            return `ignored(${val.reason})`
    }
}



const convertLogValAux = (val: Val): Value => {
    if (!isContainer(val)) {
        const expression = [makeValueText(stringifyVal(val))]
        const ignoredBy = isIgnored(val) ? val.reason : undefined
        let typeName =
            val === null ?
                "None"
                : isPrimitive(val) ?
                    typeof val
                    : val.dataType

        return {
            children: {},
            expression,
            type: typeName,
            hasHit: false,
            ignoredBy
        }
    }
    // construct from children results
    const syntax = getSyntax(val.typeName)
    let expression = [makeValueText(syntax.prefix)]
    let children: Value["children"] = {}

    for (const [k, v] of Object.entries(val.data)) {
        const childValue = convertLogValAux(v)
        const keyExpression = [makeValueText(k)]
        children[k] = {
            keyExpression,
            value: childValue
        }
        if (syntax.keyValueSep) {
            expression.push(...keyExpression)
            expression.push(makeValueText(syntax.keyValueSep))
        }
        expression.push(...childValue.expression)
        expression.push(makeValueText(syntax.sep))
    }
    const suffix = makeValueText(syntax.suffix)
    if (expression.length > 1) {
        // replace last syntax.sep (of for loop) to suffix
        expression[expression.length - 1] = suffix
    } else {
        // empty children
        expression.push(suffix)
    }
    return {
        children,
        expression,
        type: val.typeName,
        hasHit: false
    }
}

export const deserialize = (val: string): Value => {

    return convertLogValAux(JSON.parse(val))

}