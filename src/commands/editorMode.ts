import vscode from 'vscode';
import { getCurrentEditor, getDocLanguage, isSingleLineCommentWithPrefix } from '../common/utils';
import { CommandTemplate } from './common/templates';
import { Command } from './common/interfaces';
import { CommandID } from '../common/enums';
import {
    colon,
    commentTagMap,
    endTag,
    plus,
    regexpMatchTags,
    titlePrefix
} from '../common/constants';
import { EditFunc } from './common/types';

export class EditorModeCommand extends CommandTemplate {
    private static _command = new EditorModeCommand();
    public static get instance(): Command {
        return EditorModeCommand._command;
    }
    override id = CommandID.EditorMode;
    override call() {
        try {
            const editor = getCurrentEditor();
            const language = getDocLanguage(editor.document);
            const editsToDo = new Array<EditFunc>();
            for (let i = 0; i < editor.document.lineCount; i++) {
                const line = editor.document.lineAt(i);
                if (!isSingleLineCommentWithPrefix(line.text, language, titlePrefix)) {
                    continue;
                }
                const match = line.text.match(regexpMatchTags);
                if (!match) {
                    continue;
                }
                let num: number = -1;
                switch (match[1]) {
                    case colon:
                        num = Number(match[2]);
                        break;
                    case plus:
                        num = i + Number(match[2]) + 1;
                        break;
                }
                if (isNaN(num) || num <= i + 1 || num > editor.document.lineCount + 1) {
                    continue;
                }
                const end = match.index! + match[0].length;
                const start = end - (match[2].length + 1);
                editsToDo.push((editBuilder: vscode.TextEditorEdit) => {
                    editBuilder.delete(
                        new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, end))
                    );
                    editBuilder.insert(
                        editor.document.lineAt(num - 1).range.end,
                        ' ' + commentTagMap.get(language) + endTag
                    );
                });
            }
            editor.edit((editBuilder: vscode.TextEditorEdit) => {
                editsToDo.forEach((f: EditFunc) => f(editBuilder));
            });
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }
}
