
import { StateGetter, StateGetterOf } from "../store/state"
import { addProc, addState, ExposeToWebview } from "../store/store"
import * as editorPanel from "../uiWrapper/editorPanel"
import { varTraceState, metadataState } from "./logFile"
import * as core from "../../../core"
import { reloadShowOptionsState } from "./valueShowOption"

const domain = "step"

const stepState = addState(domain, "step", {
    userEditable: true as const,
    init: { step: 0 },
    depends: [metadataState, varTraceState]
})

const stepProcs = addProc(stepState, {
    "init": {
        triggers: [varTraceState],
        proc: async (get, set) => {
            set({ step: 0 })
        }
    },
    "next": {
        proc: async (get, set) => {
            const logMetadata = get(metadataState)
            const current = get(stepState)
            const nextStep = Math.min(
                current.step + 1,
                logMetadata.maxStep
            )
            set({ ...current, step: nextStep })
        }
    },
    "prev": {
        proc: async (get, set) => {
            const current = get(stepState)
            const prevStep = Math.max(current.step - 1, 0)
            set({ ...current, step: prevStep })
        }
    }
})

const stepVarFilterState = addState(domain, "filter", {
    userEditable: true as const,
    init: {
        varNameFilter: ""
    },
    depends: []
})

const init = {
    fileName: "",
    line: 0,
    variables: {} as core.StepVars
}
const detailState = addState(domain, "detail", {
    userEditable: false as const,
    init,
    depends: [stepState, varTraceState, stepVarFilterState, reloadShowOptionsState, metadataState]
})

export const initialize = () => {
    const load = async (get: StateGetterOf<typeof detailState>, set: (data: typeof init) => void) => {
        const { step } = get(stepState)
        const { varTrace } = get(varTraceState)
        const { varNameFilter } = get(stepVarFilterState)
        const { showIgnored, showFilterNotMatch } = get(reloadShowOptionsState)
        if (!varTrace) {
            return
        }
        const variables = await varTrace.getStepVars({
            step, varNameFilter, showIgnored, showFilterNotMatch
        })
        const stepInfo = await varTrace.getStepInfo(step)
        set({
            fileName: stepInfo.fileAbsPath,
            line: stepInfo.line,
            variables,
        })
    }
    const detailProcs = addProc(detailState, {
        "setEditorStep": {
            triggers: [stepState],
            proc: async (get, set) => {
                await load(get, set)
                const detail = get(detailState)
                const { fileName, line } = detail
                await editorPanel.show(fileName, line)
            }
        },
        "load": {
            triggers: [metadataState, stepState, stepVarFilterState, reloadShowOptionsState],
            proc: async (get, set) => {
                await load(get, set)
            }
        }
    })
    return detailProcs
}

export type Step =
    ExposeToWebview<typeof stepState, typeof stepProcs>

export type StepVarFilter =
    ExposeToWebview<typeof stepVarFilterState, []>

export type Detail =
    ExposeToWebview<
        typeof detailState,
        ReturnType<typeof initialize>
    >