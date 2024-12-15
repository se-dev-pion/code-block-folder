import vscode from 'vscode';
import { commentTagMap, endTag, hasSingleLineCommentSuffix, isSingleLineCommentWithPrefix, titlePrefix, titleSuffix } from './common';
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
        // [GenerateInsertions]
        const commentTag = commentTagMap.get(language) as string;
        const head: string = commentTag + titlePrefix + titleSuffix + '\n';
        const tail: string = commentTag + endTag; // [/]
        const moveCursor = (success: boolean) => {
            if (success) {
                // [FormatDocumentAndMoveCursor] 
                const newCursorPosition = new vscode.Position(selection.start.line, head.indexOf(titleSuffix));
                editor.selection = new vscode.Selection(newCursorPosition, newCursorPosition); // [/]
            }
        };
        // [InsertWithoutTextSelection]
        const selection: vscode.Selection = editor.selection;
        editor.edit(selection.isEmpty
            ? (editBuilder: vscode.TextEditorEdit) => {
                editBuilder.insert(editor.selection.active, head + tail);
            } : (editBuilder: vscode.TextEditorEdit) => {
                let extraSeparator: string;
                if (isSingleLineCommentWithPrefix(document.lineAt(selection.end.line).text, language, '')) {
                    extraSeparator = '\n\n';
                } else if (hasSingleLineCommentSuffix(document.lineAt(selection.end.line).text, language, endTag)) {
                    extraSeparator = '\n';
                } else {
                    extraSeparator = ' ';
                }
                editBuilder.insert(new vscode.Position(selection.end.line, document.lineAt(selection.end.line).text.length), extraSeparator + tail);
                const startLine = document.lineAt(selection.start.line);
                const prefixBlanks = startLine.text.replace(startLine.text.trimStart(), '');
                extraSeparator = isSingleLineCommentWithPrefix(startLine.text, language, '') ? '\n' : '';
                editBuilder.insert(new vscode.Position(selection.start.line, 0), prefixBlanks + head + extraSeparator);
            }).then(moveCursor);
        return; // [/]
    });
    context.subscriptions.push(disposable);
}