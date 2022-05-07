import * as vscode from "vscode";
import * as path from "path";
import { handleMessage } from "../messageHandler";

export type WebviewViewContent = "sidebar"


export class WebviewViewProvider implements vscode.WebviewViewProvider {
    private reactAppUri: vscode.Uri;
    private webviewView: vscode.WebviewView | undefined = undefined;

    constructor(
        public key: WebviewViewContent,
        private readonly context: vscode.ExtensionContext,
    ) {

        const reactAppPathOnDisk = vscode.Uri.file(
            path.join(this.context.extensionPath, "dist", "webview.js")
        );
        this.reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                `vartrace.${key}`, // should be same as package.json webview id
                this, {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            })
        );
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath))
            ]
        };


        webviewView.webview.html = this.createWebViewHtmlString();
        this.webviewView = webviewView
        this.webviewView.webview.onDidReceiveMessage(
            message => handleMessage(message, this))
    }

    post = (message: any) => {
        this.webviewView?.webview.postMessage(message)
    }

    private createWebViewHtmlString = () => {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vartrace View</title>
            <meta http-equiv="Content-Security-Policy"
                  content="default-src 'none';
                          img-src https:;
                          script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                          style-src vscode-resource: 'unsafe-inline';">
            <script>
                window.vscode = acquireVsCodeApi();
                window.content = "${this.key}"
            </script>
        </head>
        <body>
            <div id="root"></div>
            <script src="${this.reactAppUri}"></script>
        </body>
        </html>`;
    }

}