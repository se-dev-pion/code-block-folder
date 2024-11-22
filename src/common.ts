import vscode from 'vscode';

// [CreateMappingFromLanguageToCommentPrefix]
export const commentTagMap = new Map<string, string>();

const languages1: string[] = [
    'c',
    'cpp',
    'csharp',
    'java',
    'kotlin',
    'dart',
    'swift',
    'javascript',
    'typescript',
    'go',
    'php',
    'rust'
];

for (const language of languages1) {
    commentTagMap.set(language, "// ");
}

const languages2: string[] = [
    'python',
    'ruby',
    'shellscript',
    'perl'
];

for (const language of languages2) {
    commentTagMap.set(language, "# ");
}

const languages3: string[] = [
    'lua',
    'sql'
];

for (const language of languages3) {
    commentTagMap.set(language, "-- ");
} // [/]

export function isSingleLineCommentWithPrefix(line: string, language: string, prefix: string): boolean {
    return commentTagMap.has(language) && line.trim().startsWith(commentTagMap.get(language) + prefix);
}

export function hasSingleLineCommentSuffix(line: string, language: string, suffix: string): boolean {
    return commentTagMap.has(language) && line.trim().endsWith(commentTagMap.get(language) + suffix);
}

// [MarkerConstants]
export const titlePrefix: string = "[";
export const titleSuffix: string = "]";
export const endTag: string = titlePrefix + "/" + titleSuffix; // [/]


interface Handler<T> {
    (document: vscode.TextDocument, stack: number[], end: number): T;
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
            continue;
        } // [/]
        if (stack.length === 0) {
            continue;
        }
        // [HandleFoldableBlock]
        if (hasSingleLineCommentSuffix(line.text, language, endTag)) {
            collections.push(handler(document, stack, i));
        } // [/]
    }
    return collections;
}