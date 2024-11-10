import * as vscode from 'vscode';
import { loadFolder } from './folder';
import { highlightTitle } from './highlight';
import { registerFoldableBlockInserter } from './insert';

export function activate(context: vscode.ExtensionContext) {
	loadFolder(context);
	highlightTitle(context);
	registerFoldableBlockInserter(context);
}
