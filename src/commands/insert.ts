import vscode from 'vscode';
import { getCurrentEditor, getDocLanguage, hasSingleLineCommentSuffix, isSingleLineCommentWithPrefix } from '../common/utils';
import { commentTagMap, endTag, titlePrefix, titleSuffix } from '../common/constants';
import { CommandTemplate } from './common/templates';
import { Command } from './common/interfaces';
import { CommandID } from '../common/enums';

export class InsertCommand extends CommandTemplate {
    private static _command = new InsertCommand();
    public static get instance(): Command {
        return InsertCommand._command;
    }
    override id = CommandID.Insert;
    private moveCursor(success: boolean, editor: vscode.TextEditor) {
        if (success) {
            const line = editor.document.lineAt(editor.selection.start.line);
            const newCursorPosition = new vscode.Position(editor.selection.start.line, line.text.indexOf(titleSuffix));
            editor.selection = new vscode.Selection(newCursorPosition, newCursorPosition); // [/]
        }
    }
    override call() {
        try {
            const editor = getCurrentEditor();
            const document: vscode.TextDocument = editor.document;
            const language = getDocLanguage(document);
            // [GenerateInsertions]
            const commentTag = commentTagMap.get(language) as string;
            const head = commentTag + titlePrefix + titleSuffix + '\n';
            const tail = commentTag + endTag; // [/]
            // [InsertWithoutTextSelection]
            const selection = editor.selection;
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
                }).then((success: boolean) => {
                    this.moveCursor(success, editor);
                }); // [/]
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }
}