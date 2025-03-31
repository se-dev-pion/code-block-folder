import { registerFoldableBlocks } from './common/utils';
import vscode from 'vscode';
import { commentTagMap } from './common/constants';

export function loadFolder(context: vscode.ExtensionContext) {
    for (const language of commentTagMap.keys()) {
        const disposable = vscode.languages.registerFoldingRangeProvider(language, {
            provideFoldingRanges(document: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {
                // [GenerateFoldingRanges]
                const handler = (_document: vscode.TextDocument, stack: number[], end: number) => {
                    const start = stack.pop() as number;
                    return [new vscode.FoldingRange(start, end, vscode.FoldingRangeKind.Region)];
                };
                return registerFoldableBlocks(document, handler); // [/]
            }
        });
        context.subscriptions.push(disposable);
    }
}
