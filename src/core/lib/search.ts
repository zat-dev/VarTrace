import { ValueText, Value, isPrimitive } from "../entity/value";

export const clearHit = (decoTxt: ValueText) => {
    decoTxt.hit = []
}

const addHitToDecoTxt = (decoTxt: ValueText, searchString: string) => {
    const text = decoTxt.text
    const hitLen = searchString.length
    // clear previous result
    decoTxt.hit = []
    let i = -1
    while ((i = text.indexOf(searchString, i + 1)) >= 0) {
        decoTxt.hit.push({ start: i, end: i + hitLen })
        // if target is '111' and searchString is '11'
        // only prefix '11' is regarded as matched string.
        i += hitLen
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
