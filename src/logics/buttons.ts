import vscode from 'vscode';
import { FoldCommand } from "../commands/fold";
import { Switch2NumberCommand } from '../commands/switch2number';
import { Switch2TagCommand } from '../commands/switch2tag';
import { exampleUrl } from '../common/constants';

type MarkdownLink = ` [${string}](${string})`;

export function foldButton(startLine: number): MarkdownLink {
    const cmdUri = FoldCommand.instance.uriWithArgs(startLine);
    return ` [Fold](${cmdUri})`;
}

export function goToEndButton(docUri: vscode.Uri, endLine: number): MarkdownLink {
    const targetUri = docUri.with({ fragment: `L${endLine + 1}` });
    return ` [Go to End](${targetUri})`;
}

export function backToTopButton(docUri: vscode.Uri, startLine: number): MarkdownLink {
    const targetUri = docUri.with({ fragment: `L${startLine + 1}` });
    return ` [Back to Top](${targetUri})`;
}

export function switch2NumberButton(startLine: number, endLine: number): MarkdownLink {
    const cmdUri = Switch2NumberCommand.instance.uriWithArgs(startLine, endLine);
    return ` [Switch](${cmdUri})`;
}

export function switch2TagButton(startLine: number, endLine: number): MarkdownLink {
    const cmdUri = Switch2TagCommand.instance.uriWithArgs(startLine, endLine);
    return ` [Switch](${cmdUri})`;
}

export const exampleButton: MarkdownLink = ` [See Examples](${exampleUrl})`;