# Changelog

## [0.1.2] - 2026-08-13

- Contribute nothing to the notebook cell menus. The cell toolbar and its `...` menu are
  left exactly as VS Code ships them; the cell status bar item is the only added UI.
  The commands remain available from the Command Palette.

## [0.1.1] - 2026-08-13

- Move the copy commands out of the cell toolbar and into the cell's `...` overflow menu.
  They were contributed to the `inline` group, which rendered a button that collided with
  VS Code's own run/split/delete actions.
- Add `Copy Cell Id with Notebook Path` to that menu too.

## [0.1.0] - 2026-08-13

Initial release.

- Per-cell status bar item showing the cell index and nbformat id; click to copy.
- `Notebook: Copy Cell Id` and `Notebook: Copy Cell Id with Notebook Path` commands.
- Settings `notebookCellId.showStatusBarItem` and `notebookCellId.statusBarLabel`.
