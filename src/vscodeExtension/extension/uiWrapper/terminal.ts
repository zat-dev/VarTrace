import * as vscode from "vscode";

export class Terminal {
    private static terminalName = `Vartrace`
    private static openMessage = `
    ########################### \r\n
             VarTrace           \r\n
    ########################### \r\n
    executing your script...
    
    `
    private static getTerminal = () => {
        let terminal = vscode.window.terminals.find(x => x.name === this.terminalName)
        if (terminal !== undefined) {
            const ctrC = '\x03'
            // make sure there is no command. (user might run a command on the terminal)
            terminal.sendText(ctrC + ctrC)
        }
        terminal ??= vscode.window.createTerminal({
            name: this.terminalName,
            message: this.openMessage
        } as any)
        return terminal
    }
    static sendText = (text: string) => {
        const terminal = this.getTerminal()
        terminal.show();
        terminal.sendText(text)
    }
}