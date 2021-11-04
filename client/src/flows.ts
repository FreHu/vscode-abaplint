import * as vscode from "vscode";
import {ExtensionContext} from "vscode";
import {CommonLanguageClient} from "vscode-languageclient/node";

export class Flows {
  private panel: vscode.WebviewPanel | undefined;
  private readonly client: CommonLanguageClient;

  public constructor(client: CommonLanguageClient) {
    this.client = client;
  }

  public register(context: ExtensionContext): Flows {
    context.subscriptions.push(vscode.commands.registerCommand("abaplint.dumpstatementflows", this.show.bind(this)));
    return this;
  }

  private build(html: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>abaplint flows</title>
    </head>
    <body><pre>` + html + `</pre></body>
    </html>`;
  }

  public flowResponse(html: string) {
    console.dir("flows response");
    console.dir(html);
    console.dir("after");
    if (this.panel) {
      this.panel.webview.html = this.build(html);
    }
  }

  public show() {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
      return;
    }

    if (this.panel === undefined) {
      this.panel = vscode.window.createWebviewPanel(
        "abaplint_flows",
        "abaplint flows",
        {viewColumn: vscode.ViewColumn.Beside, preserveFocus: true},
        {enableFindWidget: true, enableCommandUris: true, enableScripts: true}
      );
      this.panel.onDidDispose(() => { this.panel = undefined; });
    } else {
      this.panel.reveal(undefined, true);
    }

    this.panel.webview.html = this.build("loading");

    this.client.sendRequest("abaplint/dumpstatementflows/request", {uri: editor.document.uri.toString(), position: editor.selection.active});
  }

}