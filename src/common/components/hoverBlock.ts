import vscode from 'vscode';
import { TextBlock } from '../interfaces';

export class HoverMarkdownBlock implements TextBlock<vscode.MarkdownString> {
    private raw: vscode.MarkdownString;
    public constructor(text?: string) {
        this.raw = new vscode.MarkdownString(text);
        this.raw.isTrusted = true;
    }
    public append(text: string): void {
        this.raw.appendMarkdown(text);
    }
    public get result(): vscode.MarkdownString {
        return this.raw;
    }
}
