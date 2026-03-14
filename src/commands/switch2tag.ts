import vscode from 'vscode';
import { getCurrentEditor, getDocLanguage } from '../common/utils';
import { commentTagMap, endTag, regexpMatchTags, titleSuffix } from '../common/constants';
import { CommandID } from '../common/enums';
import { Command } from './common/templates';

export default {
    register(context: vscode.ExtensionContext) {
        return new Command(
            context,
            CommandID.Switch2Tag,
            (startLineIndex: number, endLineIndex: number) => {
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
            }
        );
    }
};
