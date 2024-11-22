import vscode from 'vscode';
import lodash from 'lodash';
import { endTag, hasSingleLineCommentSuffix, isSingleLineCommentWithPrefix, titlePrefix, titleSuffix } from './common';

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
            const decorations = new Array<vscode.DecorationOptions>();
            const document = editor.document;
            const language = document.languageId;
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                if (isSingleLineCommentWithPrefix(line.text, language, titlePrefix) && !hasSingleLineCommentSuffix(line.text, language, endTag)) {
                    // [AddHighlightToTitle]
                    const left = line.text.indexOf(titlePrefix);
                    const start = line.range.start.translate(0, left);
                    const right = line.text.indexOf(titleSuffix);
                    const end = (right !== -1) ? line.range.start.translate(0, right + 1) : line.range.end;
                    const range = line.range.with(start, end);
                    const decoration = { range: range };
                    decorations.push(decoration); // [/]
                }
            }
            editor.setDecorations(decorationType, decorations);
        } // [/]
    }, 500);
    updateDecorations();
    // [AddEventListeners]
    vscode.workspace.onDidOpenTextDocument(updateDecorations);
    vscode.workspace.onDidChangeTextDocument(updateDecorations);
    vscode.window.onDidChangeActiveTextEditor(updateDecorations);
    vscode.window.onDidChangeVisibleTextEditors(updateDecorations);
    vscode.window.onDidChangeTextEditorVisibleRanges(updateDecorations); // [/]
}