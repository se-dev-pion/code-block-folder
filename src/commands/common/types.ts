import vscode from 'vscode';

export type EditFunc = (editBuilder: vscode.TextEditorEdit) => void;