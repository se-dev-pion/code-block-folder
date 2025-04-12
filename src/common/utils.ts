import vscode from 'vscode';
import { commentTagMap } from './constants';
import { ErrInvalidLanguage, ErrNoActiveEditor } from './errors';

export function isSingleLineCommentWithPrefix(line: string, language: string, prefix: string) {
    return commentTagMap.has(language) && line.trim().startsWith(commentTagMap.get(language) + prefix);
}

export function hasSingleLineCommentSuffix(line: string, language: string, suffix: string) {
    return commentTagMap.has(language) && line.trim().endsWith(commentTagMap.get(language) + suffix);
}

export function debounced<T extends Function>(func: T, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    const f = (...args: any[]): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
    return f as Function as T;
}

export function getCurrentEditor() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw ErrNoActiveEditor;
    }
    return editor;
}

export function getDocLanguage(doc: vscode.TextDocument) {
    if (!commentTagMap.has(doc.languageId)) {
        throw ErrInvalidLanguage;
    }
    return doc.languageId;
}
