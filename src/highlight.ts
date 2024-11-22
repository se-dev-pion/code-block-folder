import vscode from 'vscode';
import lodash from 'lodash';
import { registerFoldableBlocks, titlePrefix, titleSuffix } from './common';

export function highlightTitle(context: vscode.ExtensionContext) {
    // [DefiniteHighlightStyle]
    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#003366',
        color: '#FFFFFF',
        opacity: '0.8'
    }); // [/]
    const updateDecorations = lodash.debounce(async () => {
        // [AddHighlightToTitles]
        for (const editor of vscode.window.visibleTextEditors) {
            const document: vscode.TextDocument = editor.document;
            const handler = (document: vscode.TextDocument, stack: number[], _end: number) => {
                const line = document.lineAt(stack.pop() as number);
                const left = line.text.indexOf(titlePrefix);
                const start = line.range.start.translate(0, left);
                const right = line.text.indexOf(titleSuffix);
                const end = (right !== -1) ? line.range.start.translate(0, right + 1) : line.range.end;
                return { range: line.range.with(start, end) };
            };
            editor.setDecorations(decorationType, registerFoldableBlocks(document, handler));
        } // [/]
    }, 50);
    updateDecorations();
    // [AddEventListeners]
    vscode.workspace.onDidOpenTextDocument(updateDecorations);
    vscode.workspace.onDidChangeTextDocument(updateDecorations);
    vscode.window.onDidChangeActiveTextEditor(updateDecorations);
    vscode.window.onDidChangeVisibleTextEditors(updateDecorations);
    vscode.window.onDidChangeTextEditorVisibleRanges(updateDecorations); // [/]
}