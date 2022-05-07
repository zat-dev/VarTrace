import { ValueText, Value, makeValueText } from "../entity/value"
import { LogLoader } from "../entity/logLoader"
import { decorateDiff } from "../lib/decorateDiff"
import { addHitToTexts, addHitToValue } from "../lib/search"



export type Query = {
    fileAbsPath: string,
    line: number,
}

export type Result = number[]

export const getLineSteps = async (logLoader: LogLoader, query: Query): Promise<Result> => {
    return await logLoader.getLineSteps(query.fileAbsPath, query.line)
}