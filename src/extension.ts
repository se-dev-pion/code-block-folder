import * as vscode from 'vscode';
import { loadFolder } from './services/folder';
import { addHighlight } from './services/highlight';
import { initCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
    initCommands(context);
    loadFolder(context);
    addHighlight();
}
