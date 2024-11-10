import { isSingleLineCommentWithPrefix, commentTagMap, hasSingleLineCommentSuffix, endTag, titlePrefix } from './common';
import vscode from 'vscode';

export function loadFolder(context: vscode.ExtensionContext) {
    for (const language of commentTagMap.keys()) {
        const disposable = vscode.languages.registerFoldingRangeProvider(language, {
            provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {
                // [GenerateFoldingRanges]
                const ranges = new Array<vscode.FoldingRange>();
                const language: string = document.languageId;
                const stack = new Array<number>();
                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i).text;
                    // [StoreIndexOfLineWithStartMarker]
                    if (isSingleLineCommentWithPrefix(line, language, titlePrefix) && !isSingleLineCommentWithPrefix(line, language, endTag)) {
                        stack.push(i);
                        continue;
                    }
                    if (stack.length === 0) {
                        continue;
                    } // [/]
                    // [AddFoldingRange]
                    if (hasSingleLineCommentSuffix(line, language, endTag)) {
                        const j = stack.pop() as number;
                        const foldingRange = new vscode.FoldingRange(j, i, vscode.FoldingRangeKind.Region);
                        ranges.push(foldingRange);
                    } // [/]
                }
                return ranges; // [/]
            }
        });
        context.subscriptions.push(disposable);
    }
}