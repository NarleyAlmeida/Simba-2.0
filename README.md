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

Build em `dist/` (Vite `base: './'`), pronto para Pages:

1. Build: `npm run build`
2. Publicar:
   - `npm run deploy:gh` (envia `dist/` para branch `gh-pages`)
   - ou `git subtree push --prefix dist origin gh-pages`
   - ou configure Pages para Source: GitHub Actions (workflow `deploy.yml`)
3. Em Settings → Pages, aponte para branch `gh-pages` (root) ou habilite “GitHub Actions”.

Notes:
- `npm run build` também cria `dist/404.html` (SPA fallback).
- `base: './'` carrega assets mesmo em subpath `/repo-name/`.
