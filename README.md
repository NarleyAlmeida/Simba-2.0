<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1RjGL6xAfQtkkJD-zhr57V1MYrOxLqjBC

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

The build output is in `dist/` and uses relative assets (Vite `base: './'`), so it works from a repo subpath.

1. Build: `npm run build`
2. Publish `dist/` to a Pages branch (examples):
   - `npm run deploy:gh` (uses `gh-pages` to push `dist/` to `gh-pages`)
   - With Git: `git subtree push --prefix dist origin gh-pages`
   - With `npx gh-pages`: `npx gh-pages -d dist`
3. In the repo settings, point GitHub Pages to the `gh-pages` branch (or to `/dist` on `main` if you prefer that layout).

Notes:
- `npm run build` also writes `dist/404.html` (copy of `index.html`) to avoid reload 404s on GitHub Pages.
- The Vite `base` is `./`, so assets load correctly even quando servido em `/repo-name/`.
