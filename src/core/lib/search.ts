import { ValueText, Value, isPrimitive } from "../entity/value";

export const clearHitFromText = (decoTxt: ValueText) => {
    decoTxt.hit = []
}

export const clearHitFromValue = (value: Value) => {
    value.hasHit = false
    value.expression.forEach(clearHitFromText)
}


const addHitToDecoTxt = (decoTxt: ValueText, searchString: string) => {
    const text = decoTxt.text
    // clear previous result
    decoTxt.hit = []
    const regexp = new RegExp(searchString, 'g')
    const matches = text.matchAll(regexp)

    for (const match of matches) {
        // note: although type errors, index, match[0] never null
        // https://github.com/microsoft/TypeScript/issues/36788
        decoTxt.hit.push({ start: match.index!, end: match.index! + match[0]!.length })
    }
    return decoTxt.hit.length > 0
}

export const addHitToTexts = (texts: ValueText[], searchString: string) => {
    let hasHit = false
    for (let text of texts) {
        hasHit ||= addHitToDecoTxt(text, searchString)
    }
    return hasHit
}

export const addHitToValue = (value: Value, searchString: string) => {
    let hasHit = false

    hasHit ||= addHitToTexts(value.expression, searchString)


    for (let child of Object.values(value.children)) {
        hasHit ||= addHitToTexts(child.keyExpression, searchString)
        hasHit ||= addHitToValue(child.value, searchString)
    }
    value.hasHit = hasHit
    return hasHit
}
