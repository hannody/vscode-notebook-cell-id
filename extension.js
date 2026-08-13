const vscode = require('vscode');

const NOTEBOOK_TYPES = ['jupyter-notebook', 'interactive'];

/**
 * VS Code's built-in ipynb serializer stores the nbformat 4.5 cell id flat on
 * the cell metadata (see extensions/ipynb notebookSerializerWorker.js, which
 * writes `n.id = a.id` from getCellMetadata). Older builds nested it under
 * `custom`, so check both.
 */
function cellId(cell) {
  const md = cell.metadata || {};
  return md.id || (md.custom && md.custom.id) || undefined;
}

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
    let text;
    if (label === 'index') {
      text = `#${cell.index}`;
    } else if (label === 'id') {
      text = id;
    } else {
      text = `#${cell.index} ${id}`;
    }

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

  context.subscriptions.push(
    vscode.commands.registerCommand('notebookCellId.copy', (arg) => copy(arg, false)),
    vscode.commands.registerCommand('notebookCellId.copyWithPath', (arg) => copy(arg, true))
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
