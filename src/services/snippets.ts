import vscode from 'vscode';
import { languages1, languages2, languages3 } from '../common/constants';

async function mountSnippetsForLanguages(
    context: vscode.ExtensionContext,
    config: { languages: readonly string[]; snippets: vscode.CompletionItem[] },
    availableLanguages: Set<string>,
    cache: Set<string>
) {
    const { languages, snippets } = config;
    const provider: vscode.CompletionItemProvider = {
        async provideCompletionItems() {
            return snippets;
        }
    };
    const validLanguages = languages.filter(
        language => !cache.has(language) && availableLanguages.has(language)
    );
    if (validLanguages.length === 0) {
        return;
    }
    validLanguages.forEach(language => cache.add(language));
    const selectors: vscode.DocumentFilter[] = validLanguages.map(language => ({
        scheme: 'file',
        language
    }));
    const disposable = vscode.languages.registerCompletionItemProvider(selectors, provider);
    context.subscriptions.push(disposable);
}

const enum CodeSnippetTitle {
    RegionStart = 'Region Start',
    RegionEnd = 'Region End',
    RegionBlock = 'Region Block'
}

const enum CodeSnippetPrefix {
    RegionStart = 'region-start',
    RegionEnd = 'region-end',
    RegionBlock = 'region-block'
}

const enum CodeSnippetDescription {
    RegionStart = 'Insert a foldable region start marker with a custom name',
    RegionEnd = 'Insert a foldable region end marker',
    RegionBlock = 'Insert a foldable region block'
}

const codeSnippets = [
    {
        [CodeSnippetTitle.RegionStart]: {
            prefix: CodeSnippetPrefix.RegionStart,
            body: ['// [$1]'],
            description: CodeSnippetDescription.RegionStart
        },
        [CodeSnippetTitle.RegionEnd]: {
            prefix: CodeSnippetPrefix.RegionEnd,
            body: ['// [/]'],
            description: CodeSnippetDescription.RegionEnd
        },
        [CodeSnippetTitle.RegionBlock]: {
            prefix: CodeSnippetPrefix.RegionBlock,
            body: ['// [$1]', '$2 // [/]'],
            description: CodeSnippetDescription.RegionBlock
        }
    },
    {
        [CodeSnippetTitle.RegionStart]: {
            prefix: CodeSnippetPrefix.RegionStart,
            body: ['# [$1]'],
            description: CodeSnippetDescription.RegionStart
        },
        [CodeSnippetTitle.RegionEnd]: {
            prefix: CodeSnippetPrefix.RegionEnd,
            body: ['# [/]'],
            description: CodeSnippetDescription.RegionEnd
        },
        [CodeSnippetTitle.RegionBlock]: {
            prefix: CodeSnippetPrefix.RegionBlock,
            body: ['# [$1]', '$2 # [/]'],
            description: CodeSnippetDescription.RegionBlock
        }
    },
    {
        [CodeSnippetTitle.RegionStart]: {
            prefix: CodeSnippetPrefix.RegionStart,
            body: ['-- [$1]'],
            description: CodeSnippetDescription.RegionStart
        },
        [CodeSnippetTitle.RegionEnd]: {
            prefix: CodeSnippetPrefix.RegionEnd,
            body: ['-- [/]'],
            description: CodeSnippetDescription.RegionEnd
        },
        [CodeSnippetTitle.RegionBlock]: {
            prefix: CodeSnippetPrefix.RegionBlock,
            body: ['-- [$1]', '$2 -- [/]'],
            description: CodeSnippetDescription.RegionBlock
        }
    }
];

function buildCompletionItems(codeSnippet: (typeof codeSnippets)[0]) {
    return Object.entries(codeSnippet).map(snippet => {
        const [title, { prefix, body, description }] = snippet;
        const label: vscode.CompletionItemLabel = {
            label: prefix,
            description: title
        };
        const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString(body.join('\n'));
        item.detail = description;
        return item;
    });
}

export async function mountAllSnippets(context: vscode.ExtensionContext) {
    const cache = new Set<string>();
    const execRegister = async () => {
        const availableLanguages = new Set(await vscode.languages.getLanguages());
        return await Promise.allSettled([
            mountSnippetsForLanguages(
                context,
                {
                    languages: languages1,
                    snippets: buildCompletionItems(codeSnippets[0])
                },
                availableLanguages,
                cache
            ),
            mountSnippetsForLanguages(
                context,
                {
                    languages: languages2,
                    snippets: buildCompletionItems(codeSnippets[1])
                },
                availableLanguages,
                cache
            ),
            mountSnippetsForLanguages(
                context,
                {
                    languages: languages3,
                    snippets: buildCompletionItems(codeSnippets[2])
                },
                availableLanguages,
                cache
            )
        ]);
    };
    await execRegister();
    vscode.extensions.onDidChange(execRegister);
}
