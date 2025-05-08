import * as vscode from 'vscode';
import { getChatGptReply } from './chatgptWeb';

export async function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('chatgptWeb.editCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }
    const document = editor.document;
    const code = document.getText();
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'ChatGPT is editing your code...',
      cancellable: false
    }, async () => {
      try {
        const prompt = `Please refactor or improve the following code:\n\n${code}`;
        const reply = await getChatGptReply(prompt);
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(code.length)
        );
        editor.edit(editBuilder => {
          editBuilder.replace(fullRange, reply);
        });
      } catch (err) {
        vscode.window.showErrorMessage(`Error: ${err}`);
      }
    });
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
