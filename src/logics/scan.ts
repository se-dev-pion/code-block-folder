import vscode from 'vscode';
import { hasSingleLineCommentSuffix, isSingleLineCommentWithPrefix } from '../common/utils';
import { endTag, regexpMatchTags, titlePrefix } from '../common/constants';
import { ModeForHandlingFoldableBlocks } from '../common/enums';

// [DetectAndRecordFoldableBlocks]
interface Handler<T> {
    (document: vscode.TextDocument, stack: number[], end: number): T[];
}

export function registerFoldableBlocks<T>(document: vscode.TextDocument, handler: Handler<T>, mode: ModeForHandlingFoldableBlocks): T[] {
    // [Preparation]
    const collections = new Array<T>();
    const language: string = document.languageId;
    const stack = new Array<number>(); // [/]
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        // [StoreIndexOfLineWithStartMarker]
        if (isSingleLineCommentWithPrefix(line.text, language, titlePrefix) && !isSingleLineCommentWithPrefix(line.text, language, endTag)) {
            stack.push(i);
            // [HandleStartMarkerWithEndingLineNumber]
            const match = regexpMatchTags.exec(line.text);
            if (match) {
                if (mode === ModeForHandlingFoldableBlocks.Ending) {
                    stack.pop();
                    continue;
                }
                const j = Number(match[1]) - 1;
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
        if (hasSingleLineCommentSuffix(line.text, language, endTag)) {
            collections.push(...handler(document, stack, i));
        } // [/]
    }
    return collections;
} // [/]
