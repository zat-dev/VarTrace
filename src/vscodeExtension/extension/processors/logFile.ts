import * as core from "../../../core"
import * as fs from "fs"
import { dumpConfState } from "./dumpConf"
import * as vscode from "vscode"
import * as path from "path"
import * as os from "os"
import { DumpConfig, makeDumpCommand } from "../../../dumper/lib";
import { SqliteLogLoarder } from "../../../logLoader/sqliteLogLoader";
import { Terminal } from "../uiWrapper/terminal";
import { FileSystemPicker } from "../uiWrapper/fileSystemPicker";
import { addState, addProc, ExposeToWebview } from "../store/store";
import { StateGetter, StateGetterOf } from "../store/state";

const prepareDir = (outDir: string, outFile: string) => {
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir)
    }

    if (fs.existsSync(outFile)) {
        fs.unlinkSync(outFile)
    }
}

const makeNewLog = (outDir: string, outFile: string) => {
    prepareDir(outDir, outFile)
    return new core.VarTrace(new SqliteLogLoarder(outFile))
}

const runDump = (extensionPath: string, conf: DumpConfig, outFile: string) => {
    const dumpCommand = makeDumpCommand(
        extensionPath,
        conf,
        outFile
    )
    Terminal.sendText(dumpCommand)
}

const domain = "logFile"

export const varTraceState = addState(domain, "varTrace", {
    userEditable: false as const,
    init: {
        varTrace: null as null | core.VarTrace
    },
    depends: [dumpConfState]
})

const getDefaultOutPath = (extensionPath: string) => {
    const outDir = path.join(extensionPath, ".vartrace")
    const outFile = path.join(outDir, "tracelog.db")
    return { outFile, outDir }
}

const vscodeLogLoadContext = "varTrace.logLoaded"

export const initialize = (extensionPath: string) => {
    const proc = addProc(varTraceState, {
        "dump": {
            proc: async (get, set) => {
                const { varTrace } = get(varTraceState)
                const conf = get(dumpConfState)
                if (varTrace) {
                    await varTrace.close()
                }
                const { outFile, outDir } = getDefaultOutPath(extensionPath)
                const newVarTrace = makeNewLog(outDir, outFile)
                runDump(extensionPath, conf, outFile)
                set({ varTrace: newVarTrace })
                vscode.commands.executeCommand('setContext', vscodeLogLoadContext, true)
            }
        },
        "open": {
            proc: async (get, set) => {
                const { varTrace } = get(varTraceState)
                if (varTrace) {
                    await varTrace.close()
                }
                const logPath = await FileSystemPicker.selectFile()

                const { outFile, outDir } = getDefaultOutPath(extensionPath)
                prepareDir(outDir, outFile)
                fs.copyFileSync(logPath, outFile)
                set({
                    varTrace: new core.VarTrace(new SqliteLogLoarder(outFile))
                })
                vscode.commands.executeCommand('setContext', vscodeLogLoadContext, true)
            }
        },
        "save": {
            proc: async (_, set) => {
                const logPath = await FileSystemPicker.selectSavePath()
                const { outFile, outDir } = getDefaultOutPath(extensionPath)
                fs.copyFileSync(outFile, logPath)
            }
        }
    })
    return proc
}


export type LogFile =
    ExposeToWebview<
        typeof varTraceState,
        ReturnType<typeof initialize>
    >


const init = {
    logFileName: "none",
    srcFiles: [] as string[],
    status: "none",
    maxStep: 0
}
export const metadataState = addState(domain, "metadata", {
    userEditable: false as const,
    init,
    depends: [varTraceState]
})


const load = async (get: StateGetterOf<typeof metadataState>, set: (data: typeof init) => void) => {
    const currentMetadata = get(metadataState)
    const { varTrace } = get(varTraceState)
    if (varTrace === null) {
        return
    }
    const srcFiles = (await varTrace.getFiles()).map(x => x.absPath)
    const metadata = await varTrace.getMetadata()
    const maxStep = metadata?.maxStep ?? 0
    set({
        srcFiles,
        maxStep,
        status: metadata?.status ?? "unknown",
        logFileName: currentMetadata.logFileName
    })
    return metadata
}

const procs = addProc(metadataState, {
    "load": {
        proc: async (get, set) => { await load(get, set) }
    },
    "autoReload": {
        triggers: [varTraceState],
        proc: async (get, set) => {
            set(init)
            const callBack = async () => {
                const medatada = await load(get, set)
                if (medatada?.status !== "completed") {
                    setTimeout(callBack, 1000)
                }
            }
            setTimeout(callBack, 1000)
        }
    }
})



export type LogMetadata =
    ExposeToWebview<
        typeof metadataState,
        typeof procs
    >
