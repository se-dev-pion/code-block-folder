import vscode from 'vscode';
import fold from './fold';
import switch2number from './switch2number';
import switch2tag from './switch2tag';
import insert from './insert';
import editorMode from './editorMode';
import readerMode from './readerMode';
import { CommandID } from '../common/enums';
import { Command } from './common/templates';

export default {
    cmds: new Map<CommandID, Command>(),
    init(context: vscode.ExtensionContext) {
        [fold, switch2number, switch2tag, insert, editorMode, readerMode].forEach(loader => {
            const cmd = loader.register(context);
            this.cmds.set(cmd.id, cmd);
        });
    }
};
