// Pure helpers with no dependency on the `vscode` module, so they can run under
// plain Node in unit tests instead of the full Extension Development Host.

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

/** Render the status bar text for a cell given the `statusBarLabel` setting. */
function formatLabel(index, id, labelSetting) {
  if (labelSetting === 'index') {
    return `#${index}`;
  }
  if (labelSetting === 'id') {
    return id;
  }
  return `#${index} ${id}`;
}

module.exports = { cellId, formatLabel };
