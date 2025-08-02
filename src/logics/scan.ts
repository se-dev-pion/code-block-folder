import vscode, { Position } from 'vscode';
import { hasSingleLineCommentSuffix, isSingleLineCommentWithPrefix } from '../common/utils';
import { endTag, regexpMatchTags, titlePrefix } from '../common/constants';
import { ModeForHandlingFoldableBlocks } from '../common/enums';

// [DetectAndRecordFoldableBlocks]
interface Handler<T> {
    (document: vscode.TextDocument, stack: number[], end: number): T[];
}

export function registerFoldableBlocks<T>(
    document: vscode.TextDocument,
    handler: Handler<T>,
    mode: ModeForHandlingFoldableBlocks
) {
    // [Preparation]
    const collections = new Array<T>();
    const areasNeedUpdate = new Array<[number, number]>();
    const stack = new Array<number>(); // [/]
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        // [StoreIndexOfLineWithStartMarker]
        if (
            isSingleLineCommentWithPrefix(line.text, document.languageId, titlePrefix) &&
            !isSingleLineCommentWithPrefix(line.text, document.languageId, endTag)
        ) {
            stack.push(i);
            // [HandleStartMarkerWithEndingLineNumber]
            const [matched, j, autoUpdate] = matchTitle(line.text, i);
            if (matched) {
                if (mode === ModeForHandlingFoldableBlocks.Ending) {
                    stack.pop();
                    continue;
                }
                if (j > i) {
                    collections.push(...handler(document, stack, j));
                    if (autoUpdate) {
                        areasNeedUpdate.push([i, j]);
                    }
                }
            } // [/]
            continue;
        } // [/]
        if (stack.length === 0) {
            continue;
        }
        // [HandleFoldableBlock]
        if (hasSingleLineCommentSuffix(line.text, document.languageId, endTag)) {
            collections.push(...handler(document, stack, i));
        } // [/]
    }
    return [collections, areasNeedUpdate] as const;
} // [/]

export function matchTitle(content: string, start: number) {
    const result = content.match(regexpMatchTags);
    let end = -1;
    let autoUpdate = false;
    if (result) {
        switch (result[1]) {
            case ':':
                end = Number(result[2]) - 1;
                break;
            case '+':
                end = start + Number(result[2]);
                autoUpdate = true;
                break;
        }
    }
    return [result, end, autoUpdate] as const;
}

export function extractRowsCoverCount(document: vscode.TextDocument, line: number) {
    const content = document.lineAt(line);
    const result = content.text.match(regexpMatchTags)!;
    const start = result.index! + result[0].indexOf(']+') + 2;
    const end = start + result[2].length;
    return [
        content.range.with(new Position(line, start), new Position(line, end)),
        Number(result[2])
    ] as const;
}
