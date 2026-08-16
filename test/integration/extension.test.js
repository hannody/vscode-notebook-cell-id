const assert = require('node:assert/strict');
const vscode = require('vscode');

suite('Extension', () => {
  test('activates and registers its commands', async () => {
    const ext = vscode.extensions.getExtension('Mohand-Abu-Nayla.notebook-cell-id');
    assert.ok(ext, 'extension not found');

    await ext.activate();

    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('notebookCellId.copy'));
    assert.ok(commands.includes('notebookCellId.copyWithPath'));
    assert.ok(commands.includes('notebookCellId.findById'));
  });
});
