import { Value, ValueText } from "../entity/value"
import { LogLoader } from "../entity/logLoader"
import { decorateDiff } from "../lib/decorateDiff"
import { addHitToTexts } from "../lib/search"

export type Query = {
    step: number,
    varNameFilter: string,
    showIgnored?: boolean,
    showFilterNotMatch?: boolean,
}

export type Result = {
    [scope in Scope]: {
        varName: ValueText[],
        before: Value | undefined,
        after: Value | undefined
    }[]
}

export const getStepVars = async (logLoader: LogLoader, query: Query) => {
    const { step, varNameFilter, showIgnored, showFilterNotMatch } = query
    const currentVariables = await logLoader.getStepVariables(step)
    const nextVariables = await logLoader.getStepVariables(step + 1)
    const keys = new Set([...Object.keys(currentVariables), ...Object.keys(nextVariables)])
    let result: Result = {
        "local": [],
        "global": []
    }
    for (const key of keys) {
        const current = currentVariables[key]
        const next = nextVariables[key]
        const varName = current?.varName ?? next?.varName!
        const scopeKind = current?.scopeKind ?? next?.scopeKind!
        const before = current?.val
        const after = next?.val
        if (!showIgnored) {
            const isBeforeIgnoredOrUndef =
                before === undefined || before.ignoredBy !== undefined
            const isAfterIgnoredOrUndef =
                after === undefined || after.ignoredBy !== undefined
            if (isBeforeIgnoredOrUndef && isAfterIgnoredOrUndef) {
                continue
            }
        }
        if (before) {
            decorateDiff(before, after)
        }
        if (after) {
            decorateDiff(after, before)
        }
        let scope = scopeKind

        if (varNameFilter) {
            const hasHit = addHitToTexts(varName, varNameFilter)
            if (!showFilterNotMatch && !hasHit) {
                continue
            }
        }
        result[scope].push({ varName, before, after })
    }
    return result
}
