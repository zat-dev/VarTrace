import { Value } from "../entity/value"
import { LogLoader } from "../entity/logLoader"
import { decorateDiff } from "../lib/decorateDiff"

export type Result = {
    returnVal: Value | undefined;
    step: number;
    stepKind: string;
    fileAbsPath: string;
    line: number;
    functionName: string;
}

export const getStepInfo = async (logLoader: LogLoader, step: number): Promise<Result> => {
    const stepInfo = await logLoader.getStepInfo(step)
    let returnVal = stepInfo.returnVal
    if (returnVal !== undefined) {
        decorateDiff(returnVal, undefined)
    }
    return {
        ...stepInfo,
        returnVal
    }
}