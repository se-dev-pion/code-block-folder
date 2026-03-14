import vscode from 'vscode';
import { getCurrentEditor, getDocLanguage } from '../common/utils';
import { commentTagMap, titleSuffix } from '../common/constants';
import { CommandID } from '../common/enums';
import { Command } from './common/templates';

export default {
    register(context: vscode.ExtensionContext) {
        return new Command(
            context,
            CommandID.Switch2Number,
            (startLineIndex: number, endLineIndex: number) => {
                const editor = getCurrentEditor();
                const document = editor.document;
                const language = getDocLanguage(document);
                editor.edit((editBuilder: vscode.TextEditorEdit) => {
                    const startLine = document.lineAt(startLineIndex).text;
                    editBuilder.insert(
                        new vscode.Position(startLineIndex, startLine.indexOf(titleSuffix) + 1),
                        `+${endLineIndex - startLineIndex}`
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
            }
        );
    }
};
