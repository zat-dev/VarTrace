import * as core from "../../../core"
import { metadataState, varTraceState } from "./logFile"
import { addProc, addState, ExposeToWebview } from "../store/store"
import { StateGetter, StateGetterOf } from "../store/state"
import * as editorPanel from "../uiWrapper/editorPanel"
import { reloadShowOptionsState } from "./valueShowOption"

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
                return
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
    const { showIgnored, filterOnlyHighlight } = get(reloadShowOptionsState)
    set({ ...currentResult, loading: true })
    if (varTrace === null) {
        return
    }
    const result = await
        varTrace.getVarChangeLog({
            ...userInput,
            showIgnored,
            filterOnlyHighlight
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

