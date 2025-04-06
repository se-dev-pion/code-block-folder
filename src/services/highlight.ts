import vscode from 'vscode';
import { colorIdBackground, colorIdForeground, configKey, configKeyEndingBorderColor, configKeyTitleBackgroundColor, configKeyTitleTextColor, regexpMatchTags } from '../common/constants';
import { debounced } from '../common/utils';
import { registerFoldableBlocks } from '../logics/scan';
import { decorateEnding, decorateTitle } from '../logics/decorate';
import { backToTopButton, exampleButton, foldButton, goToEndButton, switch2NumberButton, switch2TagButton } from '../logics/buttons';
import { ModeForHandlingFoldableBlocks } from '../common/enums';

let titleDecoration: vscode.TextEditorDecorationType;
let endingDecoration: vscode.TextEditorDecorationType;
export function addHighlight() {
    const updateDecorations = debounced(async () => {
        for (const editor of vscode.window.visibleTextEditors) {
            // [AddHighlightToTitles]
            const titles = registerFoldableBlocks(editor.document,
                (document: vscode.TextDocument, stack: number[], end: number) => {
                    return buildDecoratedRanges(...decorateTitle(document, stack, end));
                }, ModeForHandlingFoldableBlocks.Title);
            editor.setDecorations(titleDecoration, titles); // [/]
            // [AddHighlightToEndings]
            const endings = registerFoldableBlocks(editor.document,
                (document: vscode.TextDocument, stack: number[], end: number) => {
                    return buildDecoratedRanges(...decorateEnding(document, stack, end));
                }, ModeForHandlingFoldableBlocks.Ending);
            editor.setDecorations(endingDecoration, endings); // [/]
        }
    }, 50);
    initDecorations();
    updateDecorations();
    // [AddEventListeners]
    vscode.workspace.onDidOpenTextDocument(updateDecorations);
    vscode.workspace.onDidChangeTextDocument(updateDecorations);
    vscode.workspace.onDidChangeConfiguration(() => {
        initDecorations();
        updateDecorations();
    });
    vscode.window.onDidChangeActiveTextEditor(updateDecorations);
    vscode.window.onDidChangeVisibleTextEditors(updateDecorations);
    vscode.window.onDidChangeTextEditorVisibleRanges(updateDecorations);
    vscode.window.onDidChangeActiveColorTheme(updateDecorations);
    vscode.window.onDidChangeTextEditorSelection(updateDecorations); // [/]
}

function buildDecoratedRanges(document: vscode.TextDocument, lineToBeDecorated: vscode.TextLine, rangeStart: vscode.Position, rangeEnd: vscode.Position, startLine: number, endLine: number, title: string): vscode.DecorationOptions[] {
    const rangesToDecorate = new Array<vscode.DecorationOptions>();
    const range: vscode.Range = lineToBeDecorated.range.with(rangeStart, rangeEnd);
    const hoverMessage = new vscode.MarkdownString();
    hoverMessage.isTrusted = true;
    const lineRange = `${startLine + 1}-${endLine + 1}`;
    if (lineToBeDecorated.lineNumber === startLine) {
        hoverMessage.appendMarkdown(`${foldButton(startLine)}: ${lineRange}`);
        hoverMessage.appendMarkdown(goToEndButton(document.uri, endLine));
        const titleLine = document.lineAt(startLine).text;
        const match = titleLine.match(regexpMatchTags);
        if (match) {
            const extraHoverMessage = new vscode.MarkdownString(switch2TagButton(startLine, endLine));
            extraHoverMessage.isTrusted = true;
            const start = rangeEnd.translate(0, 1);
            const end = start.translate(0, match[1].length);
            rangesToDecorate.push({
                range: lineToBeDecorated.range.with(start, end),
                hoverMessage: extraHoverMessage
            });
        }
    } else {
        hoverMessage.appendMarkdown(`${switch2NumberButton(startLine, endLine)}: ${lineRange}`);
        hoverMessage.appendMarkdown(`${backToTopButton(document.uri, startLine)} -> \`${title}\``);
    }
    hoverMessage.appendMarkdown(`\n\n${exampleButton}`);
    return rangesToDecorate.concat({ range, hoverMessage });
}

function initDecorations() {
    const titleTextColor = vscode.workspace.getConfiguration(configKey).get(configKeyTitleTextColor) as string;
    const titleBackgroundColor = vscode.workspace.getConfiguration(configKey).get(configKeyTitleBackgroundColor) as string;
    titleDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: titleBackgroundColor || new vscode.ThemeColor(colorIdForeground),
        color: titleTextColor || new vscode.ThemeColor(colorIdBackground),
        fontWeight: 'bold',
    });
    const endingBorderColor = vscode.workspace.getConfiguration(configKey).get(configKeyEndingBorderColor) as string;
    endingDecoration = vscode.window.createTextEditorDecorationType({
        borderColor: endingBorderColor || new vscode.ThemeColor(colorIdForeground),
        borderWidth: '2px',
        borderStyle: 'solid',
    });
}