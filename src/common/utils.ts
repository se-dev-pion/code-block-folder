import vscode from 'vscode';
import { commentTagMap, endTag, regexpMatchTags, titlePrefix } from './constants';

export function isSingleLineCommentWithPrefix(line: string, language: string, prefix: string): boolean {
    return commentTagMap.has(language) && line.trim().startsWith(commentTagMap.get(language) + prefix);
}

export function hasSingleLineCommentSuffix(line: string, language: string, suffix: string): boolean {
    return commentTagMap.has(language) && line.trim().endsWith(commentTagMap.get(language) + suffix);
}

// [DetectAndRecordFoldableBlocks]
interface Handler<T> {
    (document: vscode.TextDocument, stack: number[], end: number): T[];
}
export function registerFoldableBlocks<T>(document: vscode.TextDocument, handler: Handler<T>): T[] {
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

export function debounced<T extends Function>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout | null = null;
    const f: Function = (...args: any[]): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
    return f as T;
}
