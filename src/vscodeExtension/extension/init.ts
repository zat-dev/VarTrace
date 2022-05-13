import * as dumpConf from "./processors/dumpConf"
import * as breakPoint from "./processors/breakPoint"
import * as logFile from "./processors/logFile"
import * as varChangeLog from "./processors/varChangeLog"
import * as stepDetail from "./processors/step"
import * as valueShowOption from "./processors/valueShowOption"
import * as panelHandle from "./processors/panelHandle"
import * as vscode from "vscode";
import * as store from "./store/store"
import { StateGetter } from "./store/state"
import * as EditorPanel from "./uiWrapper/editorPanel"
import { WebviewViewProvider } from "./uiWrapper/webviewView"
import { WebviewPanel } from "./uiWrapper/webviewPanel"
import { inform } from "./uiWrapper/notification"
import { CancelByFailure, CancelByUser } from "./processors/common"

type Panels = Parameters<typeof panelHandle.initialize>[0]

const initProcs = (context: vscode.ExtensionContext, panels: Panels) => {
    logFile.initialize(context.extensionPath)
    stepDetail.initialize()
    panelHandle.initialize(panels)
    breakPoint.initialize()
    varChangeLog.initialize()
    dumpConf.initialize()
    valueShowOption.initialize()
}

const createUiWrappers = (context: vscode.ExtensionContext) => {
    return {
        "sidebar": new WebviewViewProvider("sidebar", context),
        panels: {
            "step detail": new WebviewPanel("step detail", context),
            "variable change log": new WebviewPanel("variable change log", context),
        }
    }
}

const registerCommand = (context: vscode.ExtensionContext, command: string, action: () => Promise<void>) => {
    let disposable = vscode.commands.registerCommand(
        command,
        () => {
            try {
                action()
            }
            catch (e) {
                if (e instanceof CancelByFailure) {
                    inform(`${e}`)
                }
                else if (e instanceof CancelByUser) {
                    // user cancel shows nothing
                }
                else {
                    inform(`unhandled exception occured: ${e}`)
                }
            }
        }
    );
    context.subscriptions.push(disposable);
}

const registerVscodeCall = (context: vscode.ExtensionContext) => {
    registerCommand(context, "extension.vartrace", async () => {
        await store.callProc<dumpConf.DumpConf>("dumpConf/userInput", "complementExecCommand")
        await store.callProc<logFile.LogFile>("logFile/varTrace", "dump")
        await store.callProc<panelHandle.PanelHandle>("panel/open", "openStepDetail")
        await store.callProc<panelHandle.PanelHandle>("panel/open", "openVarChangeLog")
    })
    registerCommand(context, "setVarNameFromCursor", async () => {
        await store.callProc<panelHandle.PanelHandle>("panel/open", "openVarChangeLog")
        await store.callProc<varChangeLog.UserInput>("varChangeLog/userInput", "setVarNameFromCursor")
        await store.callProc<varChangeLog.Result>("varChangeLog/result", "load")
    })
    vscode.debug.onDidChangeBreakpoints(
        () => store.callProc<breakPoint.BreakPoints>("breakPoints/breakPoints", "readFromVscode")
    )
}

export const init = (context: vscode.ExtensionContext) => {
    registerVscodeCall(context)
    const uiWrappers = createUiWrappers(context)
    initProcs(context, uiWrappers.panels)
}