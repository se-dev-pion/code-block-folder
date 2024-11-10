import { isSingleLineCommentWithPrefix, commentTagMap, hasSingleLineCommentSuffix } from './common';
import vscode from 'vscode';

export function loadFolder(context: vscode.ExtensionContext) {
    const endTag: string = '[/]';
    for (const language of commentTagMap.keys()) {
        const disposable = vscode.languages.registerFoldingRangeProvider(language, {
            provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {
                const ranges = new Array<vscode.FoldingRange>();
                const stack = new Array<number>();
                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i).text;
                    if (isSingleLineCommentWithPrefix(line, document.languageId, '[') && !isSingleLineCommentWithPrefix(line, document.languageId, endTag)) {
                        stack.push(i);
                        continue;
                    }
                    if (stack.length === 0) {
                        continue;
                    }
                    if (hasSingleLineCommentSuffix(line, document.languageId, endTag)) {
                        const foldingRange = new vscode.FoldingRange(stack.pop() as number, i, vscode.FoldingRangeKind.Region);
                        ranges.push(foldingRange);
                        continue;
                    }
                }
                return ranges;
            }
        });
        context.subscriptions.push(disposable);
    }
}