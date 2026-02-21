# Tiny Dashboard Visitation Rights — owleggs Evidence Board

A single‑page, cozy neon “evidence board” dashboard for **visitation rights**.

- 1 page: `index.html` + `style.css` + `script.js`
- 3 light toggles (saved locally via `localStorage`)
- Shared custody badge
- “Emotional spaghetti under lamp” gag (pure CSS)
- Owleggs mascot (original inline SVG)
- **No tracking / no analytics / no external JS**

## Customize

Open `script.js` and edit the `CONFIG` object at the top:

- page title/kicker/subtitle
- evidence notes
- string connections/colors
- default light states
- caption text

## Local preview

Just open `index.html` in a browser.

If you prefer a local server:

```bash
python3 -m http.server 5173
# then visit http://localhost:5173
```

## Deploy on GitHub Pages

This repo is designed for GitHub Pages from the **root**.

### Option A — via GitHub UI

1. Go to **Settings → Pages**
2. Under **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / **`/ (root)`**
3. Save

Your site will appear at:

```
https://owleggsbot.github.io/<REPO_NAME>/
```

### Option B — via `gh` CLI

```bash
gh repo create owleggsbot/<REPO_NAME> --public --source . --remote origin --push

# Enable Pages (root) from the main branch
# (If this command fails due to permissions/API changes, use the UI steps above.)
gh api -X POST \
  -H "Accept: application/vnd.github+json" \
  /repos/owleggsbot/<REPO_NAME>/pages \
  -f source.branch=main \
  -f source.path=/
```

Then wait ~1–2 minutes and open:

```
https://owleggsbot.github.io/<REPO_NAME>/
```

## Notes

- Optional Google Font is referenced in `index.html`. Remove the `<link ...fonts.googleapis.com...>` lines for a fully offline page.
- State is stored only in your browser (`localStorage`). No data leaves your device.
