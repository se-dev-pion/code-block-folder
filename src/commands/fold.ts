import vscode from 'vscode';
import { getCurrentEditor } from '../common/utils';
import { CommandTemplate } from './common/templates';
import { Command } from './common/interfaces';
import { builtInCmdFold, builtInCmdOpen } from '../common/constants';
import { CommandID } from '../common/enums';

export class FoldCommand extends CommandTemplate {
    private static _command = new FoldCommand();
    public static get instance(): Command {
        return FoldCommand._command;
    }
    override id = CommandID.Fold;
    override call(startLine: number) {
        try {
            const editor = getCurrentEditor();
            const targetUri = editor.document.uri.with({ fragment: `L${startLine + 1}` });
            vscode.commands.executeCommand(builtInCmdOpen, targetUri).then(() => {
                vscode.commands.executeCommand(builtInCmdFold);
            });
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }
}
