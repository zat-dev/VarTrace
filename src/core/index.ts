import { LogLoader } from "./entity/logLoader"
import * as logMetadata from "./feature/logMetadata"
import { getFiles, normalizePathByLog } from "./feature/srcFiles"
import * as varChangeLog from "./feature/varChangeLog"
import * as lineVars from "./feature/lineSteps"
import * as stepVars from "./feature/stepVars"
import * as stepInfo from "./feature/stepInfo"

export { ValueText, Value } from "./entity/value"
export type VarChangeLog = varChangeLog.Result
export type LineVars = lineVars.Result
export type StepVars = stepVars.Result
export type StepInfo = stepInfo.Result
export type Metadata = logMetadata.Result
import { Cache } from "./lib/cache"
export class VarTrace {
    cache: Cache = new Cache()

    constructor(private logLoader: LogLoader) {

    }
    normalizePathByLog = async (fileAbsPath: string) => {
        return await normalizePathByLog(fileAbsPath, this.logLoader)
    }
    getFiles = async () => {
        return await getFiles(this.logLoader)
    }
    getMetadata = async () => {
        return await logMetadata.getMetadata(this.logLoader)
    }
    getVarChangeLog = async (query: varChangeLog.Query) => {
        return varChangeLog.getvarChangeLog(this.logLoader, this.cache, query)
    }
    getLineSteps = async (query: lineVars.Query) => {
        return lineVars.getLineSteps(this.logLoader, query)
    }
    getStepVars = async (query: stepVars.Query) => {
        return stepVars.getStepVars(this.logLoader, query)
    }
    getStepInfo = async (step: number) => {
        return stepInfo.getStepInfo(this.logLoader, step)
    }

    close = async () => {
        await this.logLoader.close()
    }
}

