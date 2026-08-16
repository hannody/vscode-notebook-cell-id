# Development

Plain JavaScript, no build step.

## Setup

```bash
git clone https://github.com/hannody/vscode-notebook-cell-id.git
cd vscode-notebook-cell-id
npm install
```

`npm install` may print a warning like:

```
npm warn allow-scripts 2 packages have install scripts not yet covered by allowScripts:
npm warn allow-scripts   @vscode/vsce-sign@2.0.9 (postinstall: node ./src/postinstall.js)
npm warn allow-scripts   keytar@7.9.0 (install: node-gyp rebuild)
```

Both are optional dependencies of `@vscode/vsce`, only needed for `vsce login`
(`keytar`, OS keychain) and signing published packages (`@vscode/vsce-sign`). Safe to
ignore for local dev, running, and testing. If you later need `vsce publish` to use them,
approve one at a time: `npm approve-scripts <pkg>`.

## Run it

Press <kbd>F5</kbd> in VS Code to launch an Extension Development Host with the extension
loaded, then open any `.ipynb`.

To run it in your day-to-day VS Code instead, symlink the folder into your extensions
directory and reload the window:

```bash
ln -sfn "$PWD" ~/.vscode/extensions/local.notebook-cell-id-0.1.0
```

## Test it

```bash
npm test                  # unit + integration
npm run test:unit         # cellHelpers.js logic, plain Node, no VS Code needed
npm run test:integration  # activates the extension in a real VS Code instance
```

Cell-id parsing and status bar label formatting live in `cellHelpers.js`, kept free of
any `vscode` import so `test:unit` can run them under plain Node (`node --test`).

`test:integration` uses `@vscode/test-cli`/`@vscode/test-electron` to launch a real VS
Code and check that the extension activates and its commands register. It downloads a
VS Code binary into `.vscode-test/` on first run (gitignored), so it needs network
access and is slower than the unit tests.

Manual checks, since a lot of the extension's surface is UI-driven and not worth
automating:

- Open a notebook saved in nbformat ≥4.5 — confirm each cell shows a `#index id` badge.
- Toggle `notebookCellId.showStatusBarItem` off — confirm the badge disappears.
- Try `notebookCellId.statusBarLabel` values `id` / `index` / `index-and-id`.
- Run **Copy Cell Id** / **Copy Cell Id with Notebook Path**, paste to check the clipboard.
- **Find Cell by Id** (<kbd>Ctrl+Alt+F</kbd> / <kbd>Cmd+Alt+F</kbd>) with a known id (jumps
  to the cell) and an unknown one (shows a warning).
- Open a notebook older than nbformat 4.5 — confirm no badge, and the copy commands warn
  instead of copying.
