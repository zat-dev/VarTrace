import { ProcId } from "../store/proc"
import { addState, ExposeToWebview } from "../store/store"

const domain = "valueShowOptions"

export const noReloadShowOptionsState = addState(domain, "noReload", {
    userEditable: true as const,
    init: {
        multiLineText: false,
        showNestAsTable: false
    },
    depends: []
})

export const reloadShowOptionsState = addState(domain, "reload", {
    userEditable: true as const,
    init: {
        showIgnored: false,
        showFilterNotMatch: false
    },
    depends: []
})

export const initialize = () => {
    // dummy for webpack not to remove this module
}


export type NoReloadShowOptions =
    ExposeToWebview<typeof noReloadShowOptionsState, []>

export type ReloadShowOptions =
    ExposeToWebview<typeof reloadShowOptionsState, []>