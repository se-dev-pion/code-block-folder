import vscode from 'vscode';
import { exampleUrl } from '../common/constants';
import commands from '../commands';
import { CommandID } from '../common/enums';

type MarkdownLink = ` [${string}](${string})`;

export function foldButton(startLine: number): MarkdownLink {
    const cmdUri = commands.cmds.get(CommandID.Fold)!.uriWithArgs(startLine);
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
    const cmdUri = commands.cmds.get(CommandID.Switch2Number)!.uriWithArgs(startLine, endLine);
    return ` [Switch](${cmdUri})`;
}

export function switch2TagButton(startLine: number, endLine: number): MarkdownLink {
    const cmdUri = commands.cmds.get(CommandID.Switch2Tag)!.uriWithArgs(startLine, endLine);
    return ` [Switch](${cmdUri})`;
}

export const exampleButton: MarkdownLink = ` [See Examples](${exampleUrl})`;
