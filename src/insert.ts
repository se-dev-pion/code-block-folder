import vscode from 'vscode';
import { commentTagMap, endTag, titlePrefix, titleSuffix } from './common';
export function registerFoldableBlockInserter(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("code-block-folder.insert-foldable-block", () => {
        // [CheckActiveEditor]
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        } // [/]
        const document: vscode.TextDocument = editor.document;
        // [CheckLanguageSupport]
        const language: string = document.languageId;
        if (!commentTagMap.has(language)) {
            vscode.window.showErrorMessage("Unsupported language type");
            return;
        } // [/]
        // [CheckTextSelection]
        const selection: vscode.Selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage("No text selected");
            return;
        } // [/]
        // [GenerateInsertions]
        const commentTag = commentTagMap.get(language) as string;
        const head: string = commentTag + titlePrefix + titleSuffix + '\n';
        const tail: string = ' ' + commentTag + endTag; // [/]
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
            // [AddFoldingMarkers]
            editBuilder.insert(new vscode.Position(selection.end.line, document.lineAt(selection.end.line).text.length), tail);
            editBuilder.insert(new vscode.Position(selection.start.line, 0), head); // [/]
        }).then((success: boolean) => {
            if (success) {
                // [FormatDocumentAndMoveCursor] 
                const newCursorPosition = new vscode.Position(selection.start.line, head.indexOf(titleSuffix));
                editor.selection = new vscode.Selection(newCursorPosition, newCursorPosition);
                vscode.commands.executeCommand('editor.action.formatDocument'); // [/]
            }
        });
    });
    context.subscriptions.push(disposable);
}