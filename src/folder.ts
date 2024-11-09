import { isSingleLineCommentWithPrefix, commentTagMap } from './common';
import vscode from 'vscode';

export function loadFolder(context: vscode.ExtensionContext) {
    for (const language of commentTagMap.keys()) {
        const disposable = vscode.languages.registerFoldingRangeProvider(language, {
            provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {
                const ranges = new Array<vscode.FoldingRange>();
                let start: number = -1;
                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i).text;
                    if (isSingleLineCommentWithPrefix(line, document.languageId, '[')) {
                        start = i;
                    }
                    if (isSingleLineCommentWithPrefix(line, document.languageId, ']') && start !== -1) {
                        const foldingRange = new vscode.FoldingRange(start, i, vscode.FoldingRangeKind.Region);
                        start = -1;
                        ranges.push(foldingRange);
                    }
                }
                return ranges;
            }
        });
        context.subscriptions.push(disposable);
    }
}