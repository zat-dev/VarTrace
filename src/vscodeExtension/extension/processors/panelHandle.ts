import { addState, updateState, addProc, ExposeToWebview } from "../store/store"
import { WebviewPanel, WebviewPanelContent } from "../uiWrapper/webviewPanel"

type Panels = {
    [key in WebviewPanelContent]: WebviewPanel
}

const domain = "panel"

const init = {
    'step detail': false,
    'variable change log': false
}

const panelState = addState(domain, "open", {
    userEditable: false as const,
    init,
    depends: []
})

export const initialize = (panels: Panels) => {
    for (const key in panels) {
        panels[key as WebviewPanelContent].setOnDispose(() => {
            updateState<typeof panelState>(panelState, { [key]: false })
        })
    }

    const open = (key: WebviewPanelContent) => {
        panels[key].open()
        return { [key]: true } as { [key in WebviewPanelContent]: boolean }
    }

    const proc = addProc(panelState, {
        "openStepDetail": {
            proc: async (_, set) => set(open("step detail"))
        },
        "openVarChangeLog": {
            proc: async (_, set) => set(open("variable change log"))
        }
    })
    return proc
}

export type PanelHandle =
    ExposeToWebview<
        typeof panelState,
        ReturnType<typeof initialize>
    >