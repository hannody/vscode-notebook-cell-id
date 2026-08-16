const vscode = require('vscode');
const { cellId, formatLabel } = require('./cellHelpers');

const NOTEBOOK_TYPES = ['jupyter-notebook', 'interactive'];

function shortPath(notebook) {
  const rel = vscode.workspace.asRelativePath(notebook.uri, false);
  return rel || notebook.uri.fsPath;
}

/** Resolve the cell a command was invoked on, falling back to the selected cell. */
function resolveCell(arg) {
  if (arg && arg.cell) {
    return arg.cell;
  }
  if (arg && typeof arg.index === 'number' && arg.notebook) {
    return arg;
  }
  const editor = vscode.window.activeNotebookEditor;
  if (!editor) {
    return undefined;
  }
  const selection = editor.selections[0];
  if (!selection) {
    return undefined;
  }
  return editor.notebook.cellAt(selection.start);
}

class CellIdStatusBarProvider {
  provideCellStatusBarItems(cell) {
    const config = vscode.workspace.getConfiguration('notebookCellId');
    if (!config.get('showStatusBarItem', true)) {
      return [];
    }
    const id = cellId(cell);
    if (!id) {
      return [];
    }

    const label = config.get('statusBarLabel', 'index-and-id');
    const text = formatLabel(cell.index, id, label);

    const item = new vscode.NotebookCellStatusBarItem(
      `$(copy) ${text}`,
      vscode.NotebookCellStatusBarAlignment.Right
    );
    item.command = {
      command: 'notebookCellId.copy',
      title: 'Copy Cell Id',
      arguments: [{ cell }],
    };
    item.tooltip = `nbformat cell id: ${id}\nIndex: ${cell.index}\nClick to copy`;
    return [item];
  }
}

function activate(context) {
  const provider = new CellIdStatusBarProvider();
  for (const type of NOTEBOOK_TYPES) {
    context.subscriptions.push(
      vscode.notebooks.registerNotebookCellStatusBarItemProvider(type, provider)
    );
  }

  const copy = async (arg, withPath) => {
    const cell = resolveCell(arg);
    if (!cell) {
      vscode.window.showWarningMessage('No notebook cell is selected.');
      return;
    }
    const id = cellId(cell);
    if (!id) {
      vscode.window.showWarningMessage(
        'This cell has no nbformat id (notebook is older than nbformat 4.5).'
      );
      return;
    }
    const text = withPath ? `${shortPath(cell.notebook)} cell ${id}` : id;
    await vscode.env.clipboard.writeText(text);
    vscode.window.setStatusBarMessage(`Copied: ${text}`, 3000);
  };

  const findById = async () => {
    const editor = vscode.window.activeNotebookEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active notebook.');
      return;
    }

    const id = await vscode.window.showInputBox({
      prompt: 'Enter the nbformat cell id to find',
      placeHolder: 'e.g. a1b2c3d4',
    });
    if (!id) {
      return;
    }

    const target = editor.notebook.getCells().find((cell) => cellId(cell) === id);
    if (!target) {
      vscode.window.showWarningMessage(`No cell found with id "${id}".`);
      return;
    }

    const range = new vscode.NotebookRange(target.index, target.index + 1);
    editor.selections = [range];
    editor.revealRange(range, vscode.NotebookEditorRevealType.InCenter);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('notebookCellId.copy', (arg) => copy(arg, false)),
    vscode.commands.registerCommand('notebookCellId.copyWithPath', (arg) => copy(arg, true)),
    vscode.commands.registerCommand('notebookCellId.findById', findById)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
