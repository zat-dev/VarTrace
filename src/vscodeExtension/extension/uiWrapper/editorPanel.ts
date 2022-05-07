import * as vscode from "vscode";


const highlight = (editor: vscode.TextEditor, line: number) => {
    // vscode display is 1-based. but vscode api treat line 0-based
    const anchorPos = new vscode.Position(line - 1, 0)
    const activePos = new vscode.Position(line, 0)
    const selection = new vscode.Selection(anchorPos, activePos)
    editor.selection = selection
}

const scroll = (editor: vscode.TextEditor, line: number) => {
    // vscode display is 1-based. but vscode api treat line 0-based
    const range = new vscode.Range(line - 1, 0, line, 0)
    editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport)
}
export const getWordAtCursor = () => {
    const currentEditor = vscode.window.activeTextEditor
    if (!currentEditor) {
        return undefined
    }
    const range = currentEditor.document.getWordRangeAtPosition(
        currentEditor.selection.active
    );
    return range ? currentEditor.document.getText(range) : undefined
}

export const getCurrentState = () => {
    const currentEditor = vscode.window.activeTextEditor
    if (!currentEditor) {
        return undefined
    }
    const file = currentEditor.document.fileName
    // vscode display is 1-based. but vscode api treat line 0-based
    const line = currentEditor.selection.active.line + 1
    return { file, line }
}
const openEditor = async (fileName: string) => {
    const doc = await vscode.workspace.openTextDocument(fileName)
    const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.One, false)
    return editor
}

export const show = async (fileName: string, line: number) => {
    const editor = await openEditor(fileName)
    highlight(editor, line)
    scroll(editor, line)
}

export const getBreakPoints = () => {
    const rawBreakPoints = vscode.debug.breakpoints
    const result: { [fileAbsPath: string]: number[] } = {}
    for (const point of rawBreakPoints) {
        if (!(point instanceof vscode.SourceBreakpoint)) {
            continue
        }
        const { uri, range } = point.location
        const fileAbsPath = uri.fsPath
        // in vscode api, line is 0-based.
        const line = range.start.line + 1
        result[fileAbsPath] ??= []
        result[fileAbsPath]?.push(line)
    }
    return result
}