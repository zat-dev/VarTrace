
import { ValueText, Value } from "./value"

// valid range is from 0 to getMaxStep result
export type Step = number
// line No of code(1 origin)
export type CodeLine = number

export type ScopeKind = Scope

export type StepVariables = {
    // key is any identifier string of variable
    // id number string or `${scopeName}-${varName}`...etc.
    // upstream code can be depend on only uniqueness about key
    [key: string]: {
        val: Value
        varName: ValueText[],
        scopeKind: ScopeKind,
        scopeName: string
    }
}

export type StepInfo = {
    step: Step,
    stepKind: string,
    fileAbsPath: string,
    line: number,
    functionName: string,
    returnVal: Value | undefined
}

export type LogLoadStatus = "running" | "completed"

export type Metadata = {
    language: string,
    maxStep: number,
    version: string,
    format: string,
    status: LogLoadStatus,
    basePath: string
}

export type VarChangeLog = {
    step: number,
    val: Value,
    varId: number,
    varName: ValueText[],
    scopeName: string,
    scopeKind: ScopeKind,
    prevVal: Value | undefined
}[]

export type ScopeLog = StepInfo[]

export type SrcFile = {
    absPath: string,
    modTimestamp: Date // unix time
}

// hide raw log structure
export interface LogLoader {
    validate(rawLog: unknown): boolean
    getStepInfo(step: Step): Promise<StepInfo>
    getMetadata(): Promise<Metadata | undefined>
    getFiles(): Promise<SrcFile[]>
    getLineSteps(fileAbsPath: string, line: number): Promise<number[]>
    getStepVariables(step: Step): Promise<StepVariables>
    getVarChangeLog(): Promise<VarChangeLog>
    close(): Promise<void>
}
