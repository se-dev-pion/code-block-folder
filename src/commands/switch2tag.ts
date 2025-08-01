import vscode from 'vscode';
import { getCurrentEditor, getDocLanguage } from '../common/utils';
import { commentTagMap, endTag, regexpMatchTags, titleSuffix } from '../common/constants';
import { CommandTemplate } from './common/templates';
import { Command } from './common/interfaces';
import { CommandID } from '../common/enums';

export class Switch2TagCommand extends CommandTemplate {
    private static _command = new Switch2TagCommand();
    public static get instance(): Command {
        return Switch2TagCommand._command;
    }
    override id = CommandID.Switch2Tag;
    override call(startLineIndex: number, endLineIndex: number) {
        try {
            const editor = getCurrentEditor();
            const document = editor.document;
            const language = getDocLanguage(document);
            editor.edit((editBuilder: vscode.TextEditorEdit) => {
                const startLine = document.lineAt(startLineIndex).text;
                const match = startLine.match(regexpMatchTags);
                if (!match) {
                    return;
                }
                const start = startLine.indexOf(titleSuffix) + 1;
                const end = start + match[2].length + 1;
                editBuilder.delete(
                    new vscode.Range(
                        new vscode.Position(startLineIndex, start),
                        new vscode.Position(startLineIndex, end)
                    )
                );
                const endLine = document.lineAt(endLineIndex).text;
                editBuilder.insert(
                    new vscode.Position(endLineIndex, endLine.length),
                    commentTagMap.get(language) + endTag
                );
            });
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }
}
