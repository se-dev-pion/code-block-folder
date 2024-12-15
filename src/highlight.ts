import vscode from 'vscode';
import { debounced, endTag, registerFoldableBlocks, titlePrefix, titleSuffix } from './common';

export function highlightTitle(_context: vscode.ExtensionContext) {
    // [DefiniteHighlightStyles]
    const titleDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('editor.foreground'),
        color: new vscode.ThemeColor('editor.background'),
        fontWeight: 'bold',
    });
    const endingDecoration = vscode.window.createTextEditorDecorationType({
        borderColor: new vscode.ThemeColor('editor.foreground'),
        borderWidth: '2px',
        borderStyle: 'solid',
    }); // [/]
    const updateDecorations = debounced(async () => {
        for (const editor of vscode.window.visibleTextEditors) {
            const document: vscode.TextDocument = editor.document;
            // [AddHighlightToTitles]
            const handleTitle = (document: vscode.TextDocument, stack: number[], _end: number) => {
                const line = document.lineAt(stack.pop() as number);
                const leftBorder = line.text.indexOf(titlePrefix);
                const rangeStart = line.range.start.translate(0, leftBorder);
                const rightBorder = line.text.indexOf(titleSuffix);
                const rangeEnd = (rightBorder !== -1) ? line.range.start.translate(0, rightBorder + 1) : line.range.end;
                return { range: line.range.with(rangeStart, rangeEnd) };
            };
            editor.setDecorations(titleDecoration, registerFoldableBlocks(document, handleTitle)); // [/]
            // [AddHighlightToEndings]
            const handleEnding = (document: vscode.TextDocument, _stack: number[], end: number) => {
                const line = document.lineAt(end);
                const leftBorder = line.text.indexOf(endTag);
                const rangeStart = line.range.start.translate(0, leftBorder);
                const rightBorder = leftBorder + endTag.length;
                const rangeEnd = line.range.start.translate(0, rightBorder + 1);
                return { range: line.range.with(rangeStart, rangeEnd) };
            };
            const endings = registerFoldableBlocks(document, handleEnding);
            editor.setDecorations(endingDecoration, endings); // [/]
        }
    }, 50);
    updateDecorations();
    // [AddEventListeners]
    vscode.workspace.onDidOpenTextDocument(updateDecorations);
    vscode.workspace.onDidChangeTextDocument(updateDecorations);
    vscode.window.onDidChangeActiveTextEditor(updateDecorations);
    vscode.window.onDidChangeVisibleTextEditors(updateDecorations);
    vscode.window.onDidChangeTextEditorVisibleRanges(updateDecorations);
    vscode.window.onDidChangeActiveColorTheme(updateDecorations); // [/]
}
