import { buildCmdId } from "./utils";

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
];

for (const language of languages1) {
    commentTagMap.set(language, "// ");
}

const languages2: string[] = [
    'python',
    'ruby',
    'shellscript',
    'perl',
    'nim'
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

// [MarkerConstants]
export const titlePrefix: string = "[";
export const titleSuffix: string = "]";
export const endTag: string = titlePrefix + "/" + titleSuffix; // [/]

// [ConfigKeys]
export const configKey: string = 'code-block-folder';
export const configKeyTitleTextColor: string = 'title-text-color';
export const configKeyTitleBackgroundColor: string = 'title-background-color';
export const configKeyEndingBorderColor: string = 'ending-border-color'; // [/]

export const regexpMatchTags: RegExp = /\[.*\]:([0-9]+)/;
export const exampleUrl: string = 'https://github.com/se-dev-pion/code-block-folder?tab=readme-ov-file#examples';

export const builtInCmdOpen = 'vscode.open';
export const builtInCmdFold = 'editor.fold';
export const colorIdForeground = 'editor.foreground';
export const colorIdBackground = 'editor.background';

export const customCmdFold = buildCmdId('fold');
export const customCmdSwitch2Number = buildCmdId('switch-to-number');
export const customCmdSwitch2Tag = buildCmdId('switch-to-tag');