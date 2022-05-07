import * as fs from "fs"
import { FileSystemPicker } from "../uiWrapper/fileSystemPicker";
import { getDefaultDumpConfig } from "../../../dumper/lib";
import { addState, addProc, ExposeToWebview } from "../store/store";
import * as vscode from "vscode";
import { inform } from "../uiWrapper/notification";
const domain = "dumpConf"


export const dumpConfState = addState(domain, "userInput", {
    userEditable: true as const,
    init: getDefaultDumpConfig("python"),
    depends: []
})

const procs = addProc(dumpConfState, {
    "load": {
        proc: async (_get, set) => {
            const fileSystemPath = await FileSystemPicker.selectFile()
            const content = fs.readFileSync(fileSystemPath, 'utf8');
            const userInput = JSON.parse(content)
            set(userInput)
        }
    },
    "complementExecCommand": {
        proc: async (get, set) => {
            const userInput = get(dumpConfState)
            const activeFile = vscode.window.activeTextEditor?.document.fileName ?? ""
            if (!activeFile) {
                inform("tried complementing execution command. but opened active file not found")
            }
            const execCommand = `python3 ${activeFile}`
            set({ ...userInput, execCommand })
            inform(`execution command is complemented by ${activeFile}`)
        }
    },
    "save": {
        proc: async (get) => {
            const userInput = get(dumpConfState)
            const fileSystemPath = await FileSystemPicker.selectSavePath()
            const content = JSON.stringify(userInput)
            fs.writeFileSync(fileSystemPath, content, 'utf8');
        }
    }
})


export const initialize = () => {
    // dummy for webpack not to remove this module
}

export type DumpConf = ExposeToWebview<typeof dumpConfState, typeof procs>