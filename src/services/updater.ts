import vscode, { TextDocumentChangeReason } from 'vscode';
import { extractRowsCoverCount, registerFoldableBlocks } from '../logics/scan';
import { ModeForHandlingFoldableBlocks } from '../common/enums';
import { getCurrentEditor } from '../common/utils';

export function autoUpdateFoldableAreasOnEdit() {
    const [state, setState] = useDocumentState();
    vscode.window.onDidChangeActiveTextEditor(setState);
    vscode.workspace.onDidChangeTextDocument(event => {
        if (
            event.document.lineCount === state.rows ||
            event.reason === TextDocumentChangeReason.Undo ||
            event.contentChanges.length !== 1
        ) {
            return;
        }
        try {
            const change = event.contentChanges[0];
            const editor = getCurrentEditor();
            editor
                .edit((editBuilder: vscode.TextEditorEdit) => {
                    const { start, end } = change.range;
                    const backspace = change.text === '';
                    const changedText = backspace
                        ? state.content.substring(
                              event.document.offsetAt(start),
                              event.document.offsetAt(end)
                          )
                        : change.text;
                    const delta = changedText.split('\n').length - 1;
                    if (delta === 0) {
                        return;
                    }
                    for (const [lineStart, lineEnd] of state.areas) {
                        if (start.line > lineEnd || end.line < lineStart) {
                            continue;
                        }
                        const [range, count] = extractRowsCoverCount(editor.document, lineStart);
                        if (backspace && count === delta) {
                            continue;
                        }
                        editBuilder.replace(
                            range,
                            (backspace ? count - delta : count + delta).toString()
                        );
                    }
                })
                .then(() => {
                    setState(editor);
                });
        } catch {}
    });
}

export function useDocumentState() {
    const rows = 0;
    const content = '';
    const areas = new Array<[number, number]>();
    const state = { rows, content, areas };
    const setState = (editor?: vscode.TextEditor) => {
        state.rows = editor ? editor.document.lineCount : rows;
        state.content = editor ? editor.document.getText() : content;
        state.areas = editor
            ? registerFoldableBlocks(
                  editor.document,
                  () => [],
                  ModeForHandlingFoldableBlocks.Title
              )[1]
            : areas;
    };
    return [state, setState] as const;
}
