# Publishing this extension

Everything in the repo is ready to package. What is left needs your accounts and a
machine with Node, so it is written out here for you to work through whenever you like.

## Where things stand

Done:

- Extension code (`extension.js`), manifest, icon, README, CHANGELOG, MIT LICENSE.
- `.vscodeignore` so the `.vsix` ships only the runtime files.
- `.vscode/launch.json` — <kbd>F5</kbd> opens an Extension Development Host.
- Git repo on `main`, pushed to **https://github.com/hannody/vscode-notebook-cell-id**,
  which is **private** for now.
- Symlinked into `~/.vscode/extensions/local.notebook-cell-id-0.0.1`, which is how it is
  running in your editor right now.

Not done, because it needs you:

- `publisher` in `package.json` is set to `Mohanad-Abu-Nayla` — the Marketplace publisher
  you create must use exactly that ID.
- No screenshot in the README. Worth adding before you publish; a single PNG of a cell
  showing the badge sells this better than any paragraph.

## Should you publish it at all?

Yes — it is your own code against the public `vscode` extension API. Nothing from VS Code's
source is copied into it. The one thing worth doing first is searching the Marketplace for
"notebook cell id" to see whether someone already covers this; if they do, yours can still
be the better one, but you will want to know.

## 1. Prerequisites

```bash
sudo apt install nodejs npm     # Node 20+ required by vsce
cd ~/Documents/home/vscode-notebook-cell-id
npm install
```

## 2. Make the GitHub repo public — only when you publish

The repo exists and is pushed, but it is **private**, and `package.json` points its
`repository` and `bugs` fields at it. That is fine while the extension is unpublished. The
moment you publish, those URLs become links on your Marketplace listing and will 404 for
everyone who is not you, which reads as an abandoned project.

So either flip it public at publish time:

```bash
gh repo edit hannody/vscode-notebook-cell-id --visibility public --accept-visibility-change-consequences
```

or strip the `repository` and `bugs` fields from `package.json` and keep the source closed.
`vsce` only warns about a missing repository, it does not refuse to package.

## 3. Create a Marketplace publisher

Marketplace publishing runs through Azure DevOps, which is the part that trips everyone up.

1. Create a free Azure DevOps organisation at https://dev.azure.com.
2. In Azure DevOps: **User settings → Personal Access Tokens → New Token**. Two fields
   matter and both default to the wrong value:
   - **Organization**: `All accessible organizations` (not your single org).
   - **Scopes**: `Custom defined` → **Marketplace → Manage**.

   Copy the token now; it is shown once. A token scoped to one org is the usual cause of a
   confusing `401 Unauthorized` at publish time.
3. Create the publisher at https://marketplace.visualstudio.com/manage. The **publisher ID**
   you choose there is permanent and must equal the `publisher` field in `package.json`.

## 4. Package and test locally

```bash
npx vsce package        # -> notebook-cell-id-0.1.0.vsix
code --install-extension notebook-cell-id-0.1.0.vsix
```

Reload the window and confirm the badge still appears. Before this test, remove the dev
symlink so you are not running two copies of the same extension:

```bash
rm ~/.vscode/extensions/local.notebook-cell-id-0.0.1
```

`vsce` will warn about anything missing from the manifest; the packaged size should be a
few dozen KB.

## 5. Publish

```bash
npx vsce login Mohanad-Abu-Nayla   # paste the PAT
npx vsce publish
```

The upload is instant, Marketplace validation takes a few minutes, and the listing goes
live after that. For later releases, `npx vsce publish patch|minor|major` bumps the version,
commits, and tags in one step — add the CHANGELOG entry first.

## 6. Also publish to Open VSX (recommended)

VSCodium, Cursor, Windsurf, and Gitpod do not use Microsoft's Marketplace; they pull from
[open-vsx.org](https://open-vsx.org). It is a separate account and a separate token, costs
about five minutes, and roughly doubles the audience that can install this.

```bash
npx ovsx create-namespace Mohanad-Abu-Nayla -p <open-vsx-token>
npx ovsx publish notebook-cell-id-0.1.2.vsix -p <open-vsx-token>
```

## Gotchas worth knowing

- **The extension name is permanent.** `notebook-cell-id` is generic; if you want something
  more distinctive, rename it *before* the first publish. The Marketplace identity is
  `publisher.name` and cannot be changed afterwards — only unpublished and re-published
  under a new id, losing installs and ratings.
- **Version numbers cannot be reused.** Republishing `0.1.0` is rejected even if you
  unpublish it. Bump instead.
- **`engines.vscode` is a floor, not a target.** It is set to `^1.90.0`; users on older
  builds will not be offered the extension. The `metadata.custom.id` fallback in
  `extension.js` is what makes that floor safe to keep low.
- **Unpublishing is disruptive.** `vsce unpublish` removes the extension for everyone who
  installed it. Prefer deprecating a version.
