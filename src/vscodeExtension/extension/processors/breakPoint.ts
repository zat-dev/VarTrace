
import { StateGetter, StateGetterOf } from "../store/state"
import { addProc, addState, ExposeToWebview } from "../store/store"
import * as editorPanel from "../uiWrapper/editorPanel"
import { varTraceState, metadataState } from "./logFile"
import * as core from "../../../core"
import { reloadShowOptionsState } from "./valueShowOption"

const domain = "breakPoints"

type UserInput = { [fileAbsPath: string]: number[] }

const breakPointsState = addState(domain, "breakPoints", {
    userEditable: true as const,
    init: { breakPoints: {} as UserInput },
    depends: [metadataState, varTraceState]
})

const breakPointsProcs = addProc(breakPointsState, {
    "readFromVscode": {
        triggers: [varTraceState],
        proc: async (get, set) => {
            const breakPoints = editorPanel.getBreakPoints()
            set({ breakPoints })
        }
    }
})

type Result = {
    [fileAbsPath: string]: {
        [line: number]: number[]
    }
}

const breakPointStepsState = addState(domain, "breakPointSteps", {
    userEditable: false as const,
    init: {
        breakPointSteps: {} as Result
    },
    depends: [varTraceState, breakPointsState, metadataState]
})


const breakPointStepsProcs = addProc(breakPointStepsState, {
    "load": {
        triggers: [metadataState, breakPointsState, varTraceState],
        proc: async (get, set) => {
            const { varTrace } = get(varTraceState)
            if (!varTrace) {
                throw new Error("no dump result")
            }
            const { breakPoints } = get(breakPointsState)
            let breakPointSteps: Result = {}
            for (const [rawFileAbsPath, lines] of Object.entries(breakPoints)) {
                const fileAbsPath = await varTrace.normalizePathByLog(rawFileAbsPath)
                if (fileAbsPath === undefined) {
                    continue
                }
                let fileResult: { [line: number]: number[] } = {}
                for (const line of lines) {
                    fileResult[line] = await varTrace.getLineSteps({
                        fileAbsPath,
                        line
                    })
                }
                breakPointSteps[fileAbsPath] = fileResult
            }


            set({ breakPointSteps })
        }
    }
})

export const initialize = () => {
    // dummy for webpack not to remove this module
    return
}

export type BreakPoints =
    ExposeToWebview<typeof breakPointsState, typeof breakPointsProcs>

export type BreakPointSteps =
    ExposeToWebview<typeof breakPointStepsState, typeof breakPointStepsProcs>
