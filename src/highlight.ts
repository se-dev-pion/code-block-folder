import vscode, { Position } from 'vscode';
import { commentTagMap, configKey, configKeyEndingBorderColor, configKeyTitleBackgroundColor, configKeyTitleTextColor, debounced, endTag, exampleUrl, regexpMatchTags, registerFoldableBlocks, titlePrefix, titleSuffix } from './common';

let titleDecoration: vscode.TextEditorDecorationType;
let endingDecoration: vscode.TextEditorDecorationType;
export function highlightTitle(context: vscode.ExtensionContext) {
    const foldHandler = vscode.commands.registerCommand("code-block-folder.fold", (startLine: number) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const targetUri = editor.document.uri.with({ fragment: `L${startLine + 1}` });
        vscode.commands.executeCommand("vscode.open", targetUri).then(() => {
            vscode.commands.executeCommand("editor.fold");
        });
    });
    context.subscriptions.push(foldHandler);
    const switch2NumberHandler = vscode.commands.registerCommand("code-block-folder.switch-to-number", (startLineIndex: number, endLineIndex: number) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        // [CheckLanguageSupport]
        const language: string = document.languageId;
        if (!commentTagMap.has(language)) {
            vscode.window.showErrorMessage("Unsupported language type");
            return;
        } // [/]
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
            const startLine = document.lineAt(startLineIndex).text;
            editBuilder.insert(new vscode.Position(startLineIndex, startLine.indexOf(titleSuffix) + 1), `:${endLineIndex + 1}`);
            const endLine = document.lineAt(endLineIndex).text;
            editBuilder.replace(new vscode.Range(
                new Position(endLineIndex, endLine.indexOf(commentTagMap.get(language)!)),
                new Position(endLineIndex, endLine.length)
            ), '');
        });
    });
    context.subscriptions.push(switch2NumberHandler);
    const switch2TagHandler = vscode.commands.registerCommand("code-block-folder.switch-to-tag", (startLineIndex: number, endLineIndex: number) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        // [CheckLanguageSupport]
        const language: string = document.languageId;
        if (!commentTagMap.has(language)) {
            vscode.window.showErrorMessage("Unsupported language type");
            return;
        } // [/]
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
            const startLine = document.lineAt(startLineIndex).text;
            const match = startLine.match(regexpMatchTags);
            if (!match) {
                return;
            }
            const start = startLine.indexOf(titleSuffix) + 1;
            const end = start + match[1].length + 1;
            editBuilder.replace(new vscode.Range(
                new Position(startLineIndex, start),
                new Position(startLineIndex, end)
            ), '');
            const endLine = document.lineAt(endLineIndex).text;
            editBuilder.insert(new vscode.Position(endLineIndex, endLine.length), commentTagMap.get(language) + endTag);
        });
    });
    context.subscriptions.push(switch2TagHandler);
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
                return buildDecoratedRanges(editor, lineToBeDecorated, rangeStart, rangeEnd, start, end, title);
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
                return buildDecoratedRanges(editor, lineToBeDecorated, rangeStart, rangeEnd, start, end, title);
            };
            const endings = registerFoldableBlocks(document, handleEnding);
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

function buildDecoratedRanges(editor: vscode.TextEditor, lineToBeDecorated: vscode.TextLine, rangeStart: vscode.Position, rangeEnd: vscode.Position, startLine: number, endLine: number, title: string): vscode.DecorationOptions[] {
    const rangesToDecorate = new Array<vscode.DecorationOptions>();
    const range: vscode.Range = lineToBeDecorated.range.with(rangeStart, rangeEnd);
    const docUri: vscode.Uri = editor.document.uri;
    const hoverMessage = new vscode.MarkdownString();
    hoverMessage.isTrusted = true;
    let commandUri: string;
    let targetUri: vscode.Uri;
    const lineRange = `${startLine + 1}-${endLine + 1}`;
    if (lineToBeDecorated.lineNumber === startLine) {
        commandUri = `command:code-block-folder.fold?${encodeURIComponent(JSON.stringify([startLine]))}`;
        hoverMessage.appendMarkdown(` [Fold](${commandUri}): ${lineRange}`);
        targetUri = docUri.with({ fragment: `L${endLine + 1}` });
        hoverMessage.appendMarkdown(` [Go to End](${targetUri})`);
        const titleLine = editor.document.lineAt(startLine).text;
        const match = titleLine.match(regexpMatchTags);
        if (match) {
            const extraCommandUri = `command:code-block-folder.switch-to-tag?${encodeURIComponent(JSON.stringify([startLine, endLine]))}`;
            const extraHoverMessage = new vscode.MarkdownString(` [Switch](${extraCommandUri})`);
            extraHoverMessage.isTrusted = true;
            const start = rangeEnd.translate(0, 1);
            const end = start.translate(0, match[1].length);
            rangesToDecorate.push({
                range: lineToBeDecorated.range.with(start, end),
                hoverMessage: extraHoverMessage
            });
        }
    } else {
        commandUri = `command:code-block-folder.switch-to-number?${encodeURIComponent(JSON.stringify([startLine, endLine]))}`;
        hoverMessage.appendMarkdown(` [Switch](${commandUri}): ${lineRange}`);
        targetUri = docUri.with({ fragment: `L${startLine + 1}` });
        hoverMessage.appendMarkdown(` [Back to Top](${targetUri}) -> \`${title}\``);
    }
    hoverMessage.appendMarkdown(`\n\n[See Examples](${exampleUrl})`);
    return rangesToDecorate.concat({ range, hoverMessage });
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

function initDecorations() {
    const titleTextColor = vscode.workspace.getConfiguration(configKey).get(configKeyTitleTextColor) as string;
    const titleBackgroundColor = vscode.workspace.getConfiguration(configKey).get(configKeyTitleBackgroundColor) as string;
    titleDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: titleBackgroundColor || new vscode.ThemeColor('editor.foreground'),
        color: titleTextColor || new vscode.ThemeColor('editor.background'),
        fontWeight: 'bold',
    });
    const endingBorderColor = vscode.workspace.getConfiguration(configKey).get(configKeyEndingBorderColor) as string;
    endingDecoration = vscode.window.createTextEditorDecorationType({
        borderColor: endingBorderColor || new vscode.ThemeColor('editor.foreground'),
        borderWidth: '2px',
        borderStyle: 'solid',
    });
}