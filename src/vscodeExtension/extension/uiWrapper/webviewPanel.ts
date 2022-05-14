import * as vscode from "vscode";
import * as path from "path";
import { handleMessage } from "../messageHandler";

export type WebviewPanelContent =
  "step detail"
  | "variable change log"


export class WebviewPanel {
  private panel: vscode.WebviewPanel | undefined;
  private reactAppUri: vscode.Uri;
  private isPanelDisposed = false
  private onDispose = () => { }

  constructor(
    public key: WebviewPanelContent,
    private context: vscode.ExtensionContext) {

    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
      path.join(context.extensionPath, "dist", "webview.js")
    );
    this.reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

  }

  setOnDispose = (onDispose: () => void) => {
    this.onDispose = onDispose
  }

  createPanel = () => {
    const extensionPath = this.context.extensionPath
    this.panel = vscode.window.createWebviewPanel(
      this.key,
      this.key,
      { preserveFocus: true, viewColumn: vscode.ViewColumn.Beside },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath))
        ]
      }
    );

    this.panel.webview.onDidReceiveMessage(
      message => handleMessage(message, this))
    this.panel.onDidDispose(() => {
      this.isPanelDisposed = true
      this.onDispose()
    })
    this.panel.webview.html = this.createWebViewHtmlString()
    this.panel.iconPath = vscode.Uri.joinPath(vscode.Uri.file(extensionPath), "resources", "vt.png")

  }

  open = () => {
    if (this.isPanelDisposed || this.panel === undefined) {
      this.createPanel()
      this.isPanelDisposed = false
    }
    if (!this.panel?.visible) {
      this.panel?.reveal()
    }
  }

  private createWebViewHtmlString = () => {

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vartrace Panel</title>
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

  post = (message: any) => {
    try {
      this.panel?.webview.postMessage(message)
    } catch (e) {
      // TODO: error handling
    }
  }
}