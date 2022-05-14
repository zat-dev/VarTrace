import { decorateDiff } from "../lib/decorateDiff"
import { ValueText, Value } from "../entity/value"
import { paging, Paging } from "../lib/paging"
import { addHitToTexts, addHitToValue, clearHitFromText, clearHitFromValue } from "../lib/search"
import { LogLoader, LogLoadStatus, VarChangeLog } from "../entity/logLoader"
import { abbrivateValue } from "../lib/abbrivate"
import { Cache } from "../lib/cache"
export type Query = {
    varNameFilter?: string,
    valueFilter?: string,
    showIgnored?: boolean,
    showFilterNotMatch?: boolean,
    page: number,
    pageSize: number
}

type Entry = {
    step: number,
    scopeName: string,
    scopeKind: Scope,
    varId: number,
    varName: ValueText[],
    val: Value
}

export type Result = Paging<Entry>

const isStopped = async (logLoader: LogLoader) => {
    const metadatat = await logLoader.getMetadata()
    const stoppedStatus: (LogLoadStatus | undefined)[] = ["completed"]
    return stoppedStatus.includes(metadatat?.status)
}

const getResultFromLog = async (logLoader: LogLoader) => {
    let result = await logLoader.getVarChangeLog()
    for (const entry of result) {
        decorateDiff(entry.val, entry.prevVal)
    }
    return result
}

const clearHitFromResult = (result: VarChangeLog) => {
    for (const entry of result) {
        entry.varName.forEach(x => clearHitFromText(x))
        clearHitFromValue(entry.val)
        if (entry.prevVal) {
            clearHitFromValue(entry.prevVal)
        }
    }
}

export const getvarChangeLog = async (logLoader: LogLoader, cache: Cache, query: Query): Promise<Result> => {
    const cacheKey = "varChangeLog"
    let result: VarChangeLog = cache.get(cacheKey) ?? await getResultFromLog(logLoader)
    if (!cache.has(cacheKey) && await isStopped(logLoader)) {
        cache.add(cacheKey, result)
    }
    // performance reason, var change log is cached and mutable change might remain
    clearHitFromResult(result)
    if (!query.showIgnored) {
        result = result.filter(x => x.val.type !== "ignored" || query.showIgnored)
    }

    if (query.varNameFilter) {
        const varNameFilter = query.varNameFilter
        result = result.filter(entry =>
            addHitToTexts(entry.varName, varNameFilter)
            || query.showFilterNotMatch)
    }

    if (query.valueFilter) {
        const valueFilter = query.valueFilter
        result = result.filter(entry =>
            addHitToValue(entry.val, valueFilter)
            || query.showFilterNotMatch)
    }

    const pagingResult = paging(result, query.page, query.pageSize)
    const abbrivatedContents =
        pagingResult.contents.map(x => ({
            ...x,
            val: abbrivateValue(x.val),
            prevVal: x.prevVal ? abbrivateValue(x.prevVal) : undefined
        }))
    return {
        maxPage: pagingResult.maxPage,
        page: pagingResult.page,
        contents: abbrivatedContents
    }
}
