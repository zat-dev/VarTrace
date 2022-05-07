import * as vscode from "vscode";

export class FileSystemPicker {
    private static defaultConf: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Open',
        filters: {
            'All files': ['*']
        }
    };
    static selectFile = async () => {
        const options = {
            ...FileSystemPicker.defaultConf,
            canSelectFolders: false,
            canSelectFiles: true,
        }
        const fileUri = await vscode.window.showOpenDialog(options)
        const path = fileUri && fileUri[0]?.fsPath
        if (path === undefined) {
            throw Error("path is undefined")
        }
        return path
    }
    static selectDir = async () => {
        const options = {
            ...FileSystemPicker.defaultConf,
            canSelectFolders: true,
            canSelectFiles: false,
        }
        const fileUri = await vscode.window.showOpenDialog(options)
        const path = fileUri && fileUri[0]?.fsPath
        if (path === undefined) {
            throw Error("path is undefined")
        }
        return path
    }
    static selectSavePath = async () => {
        const fileUri = await vscode.window.showSaveDialog({})
        if (fileUri === undefined) {
            throw Error("path is undefined")
        }
        return fileUri.fsPath
    }
}