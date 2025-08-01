import vscode from 'vscode';
import { getCurrentEditor, getDocLanguage } from '../common/utils';
import { commentTagMap, titleSuffix } from '../common/constants';
import { CommandTemplate } from './common/templates';
import { Command } from './common/interfaces';
import { CommandID } from '../common/enums';

export class Switch2NumberCommand extends CommandTemplate {
    private static _command = new Switch2NumberCommand();
    public static get instance(): Command {
        return Switch2NumberCommand._command;
    }
    override id = CommandID.Switch2Number;
    override call(startLineIndex: number, endLineIndex: number) {
        try {
            const editor = getCurrentEditor();
            const document = editor.document;
            const language = getDocLanguage(document);
            editor.edit((editBuilder: vscode.TextEditorEdit) => {
                const startLine = document.lineAt(startLineIndex).text;
                editBuilder.insert(
                    new vscode.Position(startLineIndex, startLine.indexOf(titleSuffix) + 1),
                    `:${endLineIndex + 1}`
                );
                const endLine = document.lineAt(endLineIndex).text;
                editBuilder.delete(
                    new vscode.Range(
                        new vscode.Position(
                            endLineIndex,
                            endLine.indexOf(commentTagMap.get(language)!)
                        ),
                        new vscode.Position(endLineIndex, endLine.length)
                    )
                );
            });
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }
}
