import vscode from 'vscode';
import { isSingleLineCommentWithPrefix } from './common';

export function highlightTitle(context: vscode.ExtensionContext) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#003366',
        color: '#FFFFFF',
        opacity: '0.8'
    });
    const updateDecorations = () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document: vscode.TextDocument = editor.document;
        const decorations = new Array<vscode.DecorationOptions>();
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            if (isSingleLineCommentWithPrefix(line.text, document.languageId, '[')) {
                const left = line.text.indexOf("[");
                const start = line.range.start.translate(0, left);
                const right = line.text.indexOf("]");
                const end = (right !== -1) ? line.range.start.translate(0, right + 1) : line.range.end;
                const range = line.range.with(start, end);
                const decoration = { range: range };
                decorations.push(decoration);
            }
        }
        editor.setDecorations(decorationType, decorations);
    };
    updateDecorations();
    vscode.workspace.onDidChangeTextDocument(updateDecorations);
    vscode.window.onDidChangeActiveTextEditor(updateDecorations);
    vscode.window.onDidChangeTextEditorVisibleRanges(updateDecorations);
}