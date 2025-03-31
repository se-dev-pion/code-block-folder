import vscode from 'vscode';
import { getCurrentEditor, getDocLanguage, hasSingleLineCommentSuffix, isSingleLineCommentWithPrefix } from './common/utils';
import { commentTagMap, endTag, titlePrefix, titleSuffix } from './common/constants';

export function registerFoldableBlockInserter(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("code-block-folder.insert-foldable-block", () => {
        try {
            const editor = getCurrentEditor();
            const document: vscode.TextDocument = editor.document;
            const language = getDocLanguage(document);
            // [GenerateInsertions]
            const commentTag = commentTagMap.get(language) as string;
            const head: string = commentTag + titlePrefix + titleSuffix + '\n';
            const tail: string = commentTag + endTag; // [/]
            const moveCursor = (success: boolean) => {
                if (success) {
                    const line = document.lineAt(selection.start.line);
                    const newCursorPosition = new vscode.Position(selection.start.line, line.text.indexOf(titleSuffix));
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
                    // [InsertEnding]
                    const endLine = document.lineAt(selection.end.line);
                    if (isSingleLineCommentWithPrefix(document.lineAt(selection.end.line).text, language, '')) {
                        extraSeparator = '\n\n';
                    } else if (hasSingleLineCommentSuffix(document.lineAt(selection.end.line).text, language, endTag)) {
                        extraSeparator = '\n';
                    } else {
                        extraSeparator = ' ';
                    }
                    editBuilder.insert(new vscode.Position(selection.end.line, endLine.text.length), extraSeparator + tail); // [/]
                    // [InsertTitle]
                    const startLine = document.lineAt(selection.start.line);
                    const prefixBlanks = startLine.text.replace(startLine.text.trimStart(), '');
                    extraSeparator = isSingleLineCommentWithPrefix(startLine.text, language, '') ? '\n' : '';
                    editBuilder.insert(new vscode.Position(selection.start.line, 0), prefixBlanks + head + extraSeparator); // [/]
                }).then(moveCursor); // [/]
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    });
    context.subscriptions.push(disposable);
}