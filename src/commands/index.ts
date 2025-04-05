import vscode from 'vscode';
import { FoldCommand } from './fold';
import { Switch2NumberCommand } from './switch2number';
import { Switch2TagCommand } from './switch2tag';
import { InsertCommand } from './insert';

export function initCommands(context: vscode.ExtensionContext) {
    FoldCommand.instance.register(context);
    Switch2NumberCommand.instance.register(context);
    Switch2TagCommand.instance.register(context);
    InsertCommand.instance.register(context);
}