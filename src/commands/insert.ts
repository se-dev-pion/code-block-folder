import vscode from 'vscode';
import {
    getCurrentEditor,
    getDocLanguage,
    hasSingleLineCommentSuffix,
    isSingleLineCommentWithPrefix
} from '../common/utils';
import { commentTagMap, endTag, titlePrefix, titleSuffix } from '../common/constants';
import { CommandID } from '../common/enums';
import { Command } from './common/templates';

export default {
    register(context: vscode.ExtensionContext) {
        const moveCursor = (success: boolean, editor: vscode.TextEditor, start: number) => {
            if (success) {
                const line = editor.document.lineAt(start);
                const newCursorPosition = new vscode.Position(
                    start,
                    line.text.indexOf(titleSuffix)
                );
                editor.selection = new vscode.Selection(newCursorPosition, newCursorPosition);
            }
        };
        return new Command(context, CommandID.Insert, () => {
            const editor = getCurrentEditor();
            const document: vscode.TextDocument = editor.document;
            const language = getDocLanguage(document);
            // [GenerateInsertions]
            const commentTag = commentTagMap.get(language) as string;
            const head = commentTag + titlePrefix + titleSuffix + '\n';
            const tail = commentTag + endTag; // [/]
            // [RecordCurrentState]
            const selection = editor.selection;
            const start = selection.start.line; // [/]
            editor
                .edit(
                    selection.isEmpty
                        ? (editBuilder: vscode.TextEditorEdit) => {
                              editBuilder.insert(editor.selection.active, head + tail);
                          }
                        : (editBuilder: vscode.TextEditorEdit) => {
                              let extraSeparator: string;
                              // [InsertEnding]
                              const endLine = document.lineAt(selection.end.line);
                              if (
                                  isSingleLineCommentWithPrefix(
                                      document.lineAt(selection.end.line).text,
                                      language,
                                      ''
                                  )
                              ) {
                                  extraSeparator = '\n\n';
                              } else if (
                                  hasSingleLineCommentSuffix(
                                      document.lineAt(selection.end.line).text,
                                      language,
                                      endTag
                                  )
                              ) {
                                  extraSeparator = '\n';
                              } else {
                                  extraSeparator = ' ';
                              }
                              editBuilder.insert(
                                  new vscode.Position(selection.end.line, endLine.text.length),
                                  extraSeparator + tail
                              ); // [/]
                              // [InsertTitle]
                              const startLine = document.lineAt(selection.start.line);
                              const prefixBlanks = startLine.text.replace(
                                  startLine.text.trimStart(),
                                  ''
                              );
                              extraSeparator = isSingleLineCommentWithPrefix(
                                  startLine.text,
                                  language,
                                  ''
                              )
                                  ? '\n'
                                  : '';
                              editBuilder.insert(
                                  new vscode.Position(selection.start.line, 0),
                                  prefixBlanks + head + extraSeparator
                              ); // [/]
                          }
                )
                .then((success: boolean) => moveCursor(success, editor, start));
        });
    }
};
