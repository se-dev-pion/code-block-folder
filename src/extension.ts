import * as vscode from 'vscode';
import { loadFolder } from './services/folder';
import { addHighlight } from './services/highlight';
import { autoUpdateFoldableAreasOnEdit } from './services/updater';
import commands from './commands';
import { mountAllSnippets } from './services/snippets';

export async function activate(context: vscode.ExtensionContext) {
    commands.init(context);
    loadFolder(context);
    addHighlight(context);
    autoUpdateFoldableAreasOnEdit();
    await mountAllSnippets(context);
}
