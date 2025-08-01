export const enum CommandID {
    Fold = 'fold',
    Insert = 'insert-foldable-block',
    Switch2Number = 'switch-to-number',
    Switch2Tag = 'switch-to-tag',
    EditorMode = 'editor-mode',
    ReaderMode = 'reader-mode'
}

export const enum ModeForHandlingFoldableBlocks {
    Both,
    Title,
    Ending
}
