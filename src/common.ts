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
}

export function isSingleLineCommentWithPrefix(line: string, language: string, prefix: string): boolean {
    return commentTagMap.has(language) && line.trim().startsWith(commentTagMap.get(language) + prefix);
}

export function hasSingleLineCommentSuffix(line: string, language: string, suffix: string): boolean {
    return commentTagMap.has(language) && line.trim().endsWith(commentTagMap.get(language) + suffix);
}

export const titlePrefix: string = "[";
export const titleSuffix: string = "]";
export const endTag: string = titlePrefix + "/" + titleSuffix;