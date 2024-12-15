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
            const handleTitle = (document: vscode.TextDocument, stack: number[], end: number) => {
                const start = stack.pop() as number;
                const lineToBeDecorated = document.lineAt(start);
                const leftBorder = lineToBeDecorated.text.indexOf(titlePrefix);
                const rightBorder = lineToBeDecorated.text.indexOf(titleSuffix);
                const rangeStart = lineToBeDecorated.range.start.translate(0, leftBorder);
                const rangeEnd = (rightBorder !== -1) ? lineToBeDecorated.range.start.translate(0, rightBorder + 1) : lineToBeDecorated.range.end;
                const title = extractTitle(lineToBeDecorated.text);
                return buildDecoratedRange(editor, lineToBeDecorated, rangeStart, rangeEnd, start, end, title);
            };
            editor.setDecorations(titleDecoration, registerFoldableBlocks(document, handleTitle)); // [/]
            // [AddHighlightToEndings]
            const handleEnding = (document: vscode.TextDocument, stack: number[], end: number) => {
                const start = stack.pop() as number;
                const lineToBeDecorated = document.lineAt(end);
                const leftBorder = lineToBeDecorated.text.indexOf(endTag);
                const rightBorder = leftBorder + endTag.length;
                const rangeStart = lineToBeDecorated.range.start.translate(0, leftBorder);
                const rangeEnd = lineToBeDecorated.range.start.translate(0, rightBorder + 1);
                const title = extractTitle(document.lineAt(start).text);
                return buildDecoratedRange(editor, lineToBeDecorated, rangeStart, rangeEnd, start, end, title);
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
    vscode.window.onDidChangeActiveColorTheme(updateDecorations);
    vscode.window.onDidChangeTextEditorSelection(updateDecorations); // [/]
}

function buildDecoratedRange(editor: vscode.TextEditor, lineToBeDecorated: vscode.TextLine, rangeStart: vscode.Position, rangeEnd: vscode.Position, startLine: number, endLine: number, title: string): vscode.DecorationOptions {
    const range: vscode.Range = lineToBeDecorated.range.with(rangeStart, rangeEnd);
    const docUri: vscode.Uri = editor.document.uri;
    const hoverMessage = new vscode.MarkdownString();
    let targetUri: vscode.Uri;
    const lineRange = `(${startLine + 1}-${endLine + 1})`;
    if (lineToBeDecorated.lineNumber === startLine) {
        hoverMessage.appendText(`${lineRange}`);
        targetUri = docUri.with({ fragment: `L${endLine + 1}` });
        hoverMessage.appendMarkdown(` [Go to End](${targetUri})`);
        // [InsertButtonBasedOnCursorPosition]
        hoverMessage.isTrusted = true;
        let button: string;
        if (editor.selection.active.line === startLine) {
            button = ' [`Fold`](command:editor.fold)';
        } else {
            const uri = docUri.with({ fragment: `L${startLine + 1}` });
            button = ' [`Focus`](' + uri + ')';
        }
        hoverMessage.appendMarkdown(button); // [/]
    } else {
        hoverMessage.appendText(`${title}: ${lineRange}`);
        targetUri = docUri.with({ fragment: `L${startLine + 1}` });
        hoverMessage.appendMarkdown(` [Back to Top](${targetUri})`);
    }
    return {
        range,
        hoverMessage,
    };
}

function extractTitle(line: string): string {
    const left: number = line.indexOf(titlePrefix);
    for (let right: number = left; right < line.length; right++) {
        if (line[right] === titleSuffix) {
            return line.substring(left, right + 1);
        }
    }
    return line.slice(left);
}
