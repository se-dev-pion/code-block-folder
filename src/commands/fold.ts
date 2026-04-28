import vscode from 'vscode';
import { getCurrentEditor } from '../common/utils';
import { CommandID } from '../common/enums';
import { Command } from './common/templates';

export default {
    register(context: vscode.ExtensionContext) {
        return new Command(context, CommandID.Fold, (startLine: number) => {
            const editor = getCurrentEditor();
            const targetUri = editor.document.uri.with({ fragment: `L${startLine + 1}` });
            vscode.commands.executeCommand('vscode.open', targetUri).then(() => {
                vscode.commands.executeCommand('editor.fold');
            });
        });
    }
};
