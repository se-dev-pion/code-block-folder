import vscode from 'vscode';
import { getCurrentEditor, getDocLanguage } from '../common/utils';
import { CommandTemplate } from './common/templates';
import { Command } from './common/interfaces';
import { CommandID, ModeForHandlingFoldableBlocks } from '../common/enums';
import { EditFunc } from './common/types';
import { registerFoldableBlocks } from '../logics/scan';
import { commentTagMap, endTag, titleSuffix } from '../common/constants';

export class ReaderModeCommand extends CommandTemplate {
    private static _command = new ReaderModeCommand();
    public static get instance(): Command {
        return ReaderModeCommand._command;
    }
    override id = CommandID.ReaderMode;
    override call() {
        try {
            const editor = getCurrentEditor();
            const language = getDocLanguage(editor.document);
            const handler = (document: vscode.TextDocument, stack: number[], end: number) => {
                const start = stack.pop() as number;
                const startLine = document.lineAt(start);
                const endLine = document.lineAt(end);
                return [
                    (editBuilder: vscode.TextEditorEdit) => {
                        editBuilder.delete(
                            new vscode.Range(
                                new vscode.Position(
                                    end,
                                    endLine.text.indexOf(' ' + commentTagMap.get(language) + endTag)
                                ),
                                endLine.range.end
                            )
                        );
                        editBuilder.insert(
                            new vscode.Position(start, startLine.text.indexOf(titleSuffix) + 1),
                            `+${end - start}`
                        );
                    }
                ];
            };
            const [editsToDo] = registerFoldableBlocks(
                editor.document,
                handler,
                ModeForHandlingFoldableBlocks.Ending
            );
            editor.edit((editBuilder: vscode.TextEditorEdit) => {
                editsToDo.forEach((f: EditFunc) => f(editBuilder));
            });
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }
}
