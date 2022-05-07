import { makeAccessor } from "./webviewMessaging"



import { DumpConf } from "../extension/processors/dumpConf"
export const dumpConf = makeAccessor<DumpConf>("dumpConf/userInput")

import { LogFile, LogMetadata } from "../extension/processors/logFile";
export const logFile = makeAccessor<LogFile>("logFile/varTrace")
export const logMetadata = makeAccessor<LogMetadata>("logFile/metadata")

import { PanelHandle } from "../extension/processors/panelHandle";
export const panelOpen = makeAccessor<PanelHandle>("panel/open")

import { ReloadShowOptions, NoReloadShowOptions } from "../extension/processors/valueShowOption";
export const reloadShowOptions =
    makeAccessor<ReloadShowOptions>("valueShowOptions/reload")
export const noReloadShowOptions =
    makeAccessor<NoReloadShowOptions>("valueShowOptions/noReload")

import { Detail, Step, StepVarFilter } from "../extension/processors/step";
export const step = makeAccessor<Step>("step/step")
export const stepVarFilter = makeAccessor<StepVarFilter>("step/filter")
export const stepDetail = makeAccessor<Detail>("step/detail")

import { BreakPointSteps }
    from "../extension/processors/breakPoint"
export const breakPointSteps = makeAccessor<BreakPointSteps>("breakPoints/breakPointSteps")


import { Result as VarChangeLogResult, UserInput as VarChangeLogUserInput }
    from "../extension/processors/varChangeLog"
export const varChangeLogUserInput = makeAccessor<VarChangeLogUserInput>("varChangeLog/userInput")
export const varChangeLogResult = makeAccessor<VarChangeLogResult>("varChangeLog/result")