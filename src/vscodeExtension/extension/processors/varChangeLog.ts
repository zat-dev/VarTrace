import * as core from "../../../core"
import { metadataState, varTraceState } from "./logFile"
import { addProc, addState, ExposeToWebview } from "../store/store"
import { StateGetter, StateGetterOf } from "../store/state"
import * as editorPanel from "../uiWrapper/editorPanel"
import { reloadShowOptionsState } from "./valueShowOption"
import { CancelByFailure } from "./common"

const domain = "varChangeLog"

const userInputState = addState(domain, "userInput", {
    userEditable: true as const,
    init: {
        valueFilter: "",
        varNameFilter: "",
        scopeFilter: ["local"] as const,
        page: 1,
        pageSize: 25
    },
    depends: []
})

const userInputProcs = addProc(userInputState, {
    "setVarNameFromCursor": {
        proc: async (get, set) => {
            const userInput = get(userInputState)
            const wordAtCursor = editorPanel.getWordAtCursor()
            if (!wordAtCursor) {
                throw new CancelByFailure("no variable found")
            }
            set({ ...userInput, varNameFilter: wordAtCursor })
        }
    },
})

const init: core.VarChangeLog & { loading: boolean } = {
    maxPage: 0,
    page: 0,
    contents: [],
    loading: false
}
const resultState = addState(domain, "result", {
    userEditable: false as const,
    init,
    depends: [userInputState, varTraceState, metadataState, reloadShowOptionsState]
})

const load = async (get: StateGetterOf<typeof resultState>, set: (data: typeof init) => void) => {
    const userInput = get(userInputState)
    const currentResult = get(resultState)
    const { varTrace } = get(varTraceState)
    const { showIgnored, showFilterNotMatch } = get(reloadShowOptionsState)
    set({ ...currentResult, loading: true })
    if (varTrace === null) {
        throw new CancelByFailure("can not access analysis result")
    }
    const result = await
        varTrace.getVarChangeLog({
            ...userInput,
            showIgnored,
            showFilterNotMatch
        })
    set({ ...result, loading: false })
}
const procs = addProc(resultState, {
    "init": {
        triggers: [varTraceState],
        proc: async (get, set) => {
            set(init)
        }
    },
    "load": {
        triggers: [metadataState, reloadShowOptionsState],
        proc: load
    }
})

export const initialize = () => {
    // dummy for webpack not to remove this module
}


export type UserInput =
    ExposeToWebview<typeof userInputState, typeof userInputProcs>

export type Result =
    ExposeToWebview<typeof resultState, typeof procs>

