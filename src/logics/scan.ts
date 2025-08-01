import vscode from 'vscode';
import { hasSingleLineCommentSuffix, isSingleLineCommentWithPrefix } from '../common/utils';
import { colon, endTag, plus, regexpMatchTags, titlePrefix } from '../common/constants';
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
            const match = regexpMatchTags.exec(line.text);
            if (match) {
                if (mode === ModeForHandlingFoldableBlocks.Ending) {
                    stack.pop();
                    continue;
                }
                let j: number = -1;
                switch (match[1]) {
                    case colon:
                        j = Number(match[2]) - 1;
                        break;
                    case plus:
                        j = i + Number(match[2]);
                        break;
                }
                if (j > i) {
                    collections.push(...handler(document, stack, j));
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
    return collections;
} // [/]
