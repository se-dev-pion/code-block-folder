import * as vscode from 'vscode';
import { loadFolder } from './folder';
import { highlightTitle } from './highlight';

export function activate(context: vscode.ExtensionContext) {
	loadFolder(context);
	highlightTitle(context);
}
