import vscode from 'vscode';
import { endTag, titlePrefix, titleSuffix } from '../common/constants';

type DecorateInfo = [vscode.TextDocument, vscode.TextLine, vscode.Position, vscode.Position, number, number, string];

export function decorateTitle(document: vscode.TextDocument, stack: number[], end: number): DecorateInfo {
    const start = stack.pop() as number;
    const lineToBeDecorated = document.lineAt(start);
    const leftBorder = lineToBeDecorated.text.indexOf(titlePrefix);
    const rightBorder = lineToBeDecorated.text.indexOf(titleSuffix);
    const rangeStart = lineToBeDecorated.range.start.translate(0, leftBorder);
    const rangeEnd = (rightBorder !== -1) ? lineToBeDecorated.range.start.translate(0, rightBorder + 1) : lineToBeDecorated.range.end;
    const title = extractTitle(lineToBeDecorated.text);
    return [document, lineToBeDecorated, rangeStart, rangeEnd, start, end, title];
}

export function decorateEnding(document: vscode.TextDocument, stack: number[], end: number): DecorateInfo {
    const start = stack.pop() as number;
    const lineToBeDecorated = document.lineAt(end);
    const leftBorder = lineToBeDecorated.text.indexOf(endTag);
    const rightBorder = leftBorder + endTag.length;
    const rangeStart = lineToBeDecorated.range.start.translate(0, leftBorder);
    const rangeEnd = lineToBeDecorated.range.start.translate(0, rightBorder + 1);
    const title = extractTitle(document.lineAt(start).text);
    return [document, lineToBeDecorated, rangeStart, rangeEnd, start, end, title];
};

function extractTitle(line: string): string {
    const left: number = line.indexOf(titlePrefix);
    for (let right: number = left; right < line.length; right++) {
        if (line[right] === titleSuffix) {
            return line.substring(left, right + 1);
        }
    }
    return line.slice(left);
}