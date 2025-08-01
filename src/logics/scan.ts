import vscode from 'vscode';
import { hasSingleLineCommentSuffix, isSingleLineCommentWithPrefix } from '../common/utils';
import { endTag, titlePrefix } from '../common/constants';
import { ModeForHandlingFoldableBlocks } from '../common/enums';
import { matchTitle } from './title';

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
            const [matched, j] = matchTitle(line.text, i);
            if (matched) {
                if (mode === ModeForHandlingFoldableBlocks.Ending) {
                    stack.pop();
                    continue;
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
