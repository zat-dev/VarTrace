import * as vscode from "vscode";

export const inform = (message: string) => {
    vscode.window.showInformationMessage(message);
}