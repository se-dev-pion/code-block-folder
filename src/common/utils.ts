import vscode from 'vscode';
import { commentTagMap } from './constants';
import { ErrInvalidLanguage, ErrNoActiveEditor } from './errors';

export function isSingleLineCommentWithPrefix(line: string, language: string, prefix: string): boolean {
    return commentTagMap.has(language) && line.trim().startsWith(commentTagMap.get(language) + prefix);
}

export function hasSingleLineCommentSuffix(line: string, language: string, suffix: string): boolean {
    return commentTagMap.has(language) && line.trim().endsWith(commentTagMap.get(language) + suffix);
}

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

export function getCurrentEditor(): vscode.TextEditor {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw ErrNoActiveEditor;
    }
    return editor;
}

export function getDocLanguage(doc: vscode.TextDocument): string {
    if (!commentTagMap.has(doc.languageId)) {
        throw ErrInvalidLanguage;
    }
    return doc.languageId;
}
