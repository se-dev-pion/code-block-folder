// [CreateMappingFromLanguageToCommentPrefix]
export const commentTagMap = new Map<string, string>();

const languages1 = [
    'c',
    'cpp',
    'csharp',
    'java',
    'kotlin',
    'dart',
    'swift',
    'javascript',
    'typescript',
    'vue',
    'javascriptreact',
    'typescriptreact',
    'svelte',
    'go',
    'php',
    'rust',
    'odin',
    'zig',
    'd',
    'v',
    'scala',
    'groovy',
    'fsharp',
    'scss',
    'sass',
    'less',
    'stylus'
] as const;

for (const language of languages1) {
    commentTagMap.set(language, '// ');
}

const languages2 = ['python', 'ruby', 'shellscript', 'perl', 'nim'] as const;

for (const language of languages2) {
    commentTagMap.set(language, '# ');
}

const languages3 = ['lua', 'sql'] as const;

for (const language of languages3) {
    commentTagMap.set(language, '-- ');
} // [/]

// [MarkerConstants]
export const titlePrefix = '[';
export const titleSuffix = ']';
export const endTag = titlePrefix + '/' + titleSuffix; // [/]

// [ConfigKeys]
export const configKey = 'code-block-folder';
export const configKeyTitleTextColor = 'title-text-color';
export const configKeyTitleBackgroundColor = 'title-background-color';
export const configKeyEndingBorderColor = 'ending-border-color'; // [/]

// [RuntimeBuiltInConstants]
export const builtInCmdOpen = 'vscode.open';
export const builtInCmdFold = 'editor.fold';
export const colorIdForeground = 'editor.foreground';
export const colorIdBackground = 'editor.background'; // [/]

export const regexpMatchTags = /\[.*\]([:|+])([0-9]+)/;
export const exampleUrl =
    'https://github.com/se-dev-pion/code-block-folder?tab=readme-ov-file#examples';
export const colon = ':';
export const plus = '+';
