# Repository Guidelines

Use this guide to navigate the codebase and contribute changes with minimal friction. Keep updates concise, reversible, and aligned with the existing patterns.

## Project Structure & Module Organization
- `index.html`: Loads Tailwind via CDN, sets the import map for React/lucide, and mounts `#root` while importing `/index.tsx`.
- `index.tsx`: Single-page React + TypeScript entry; all UI logic and state live here (dashboard, triage flows, AI prompts). Types are declared near usage (`QuestionnaireData`, component props).
- `vite.config.ts`: Exposes `process.env.API_KEY`/`GEMINI_API_KEY`, sets alias `@` to repo root, and configures the dev server.
- `tsconfig.json`: Bundler module resolution, `jsx: react-jsx`, and root-level path aliasing.
- `.env.local`: Set `GEMINI_API_KEY=<your-key>`; never commit secrets.

## Build, Test, and Development Commands
- `npm install`: Install dependencies (Vite, React, lucide, Google GenAI SDK).
- `npm run dev`: Start the Vite dev server (default `http://localhost:3000`).
- `npm run build`: Production build to `dist/`.
- `npm run preview`: Serve the built assets for a smoke test.

## Coding Style & Naming Conventions
- Prefer functional components and React hooks; keep handlers and derived state close to the JSX they affect.
- TypeScript: annotate props/objects explicitly (see `QuestionnaireData`), avoid `any`, and reuse shared types.
- Imports: use ES modules and the `@` alias for root-relative paths when files are added.
- Styling: Tailwind utility classes live in JSX strings; group classes by layout → spacing → color for readability.
- Formatting: follow existing patterns—2-space indentation, semicolons, and mostly single quotes.

## Testing Guidelines
- No automated tests exist yet; at minimum, run `npm run dev` and validate critical flows (questionnaire toggles, AI requests, file upload controls) before submitting.
- If you add tests, use `*.test.tsx` colocated with the component and prefer React Testing Library + Vitest for render/interaction coverage.

## Commit & Pull Request Guidelines
- Keep commits small and purposeful; use clear messages (e.g., `feat: add cabimento validation`, `fix: guard empty API key`). If adopting a convention, favor Conventional Commits.
- PRs should include: a short summary, screenshots/GIFs for UI changes, steps to reproduce/test, and notes on env/config changes (e.g., new required keys).
- Reference related issues/tasks where applicable and call out any known limitations or follow-ups.

## Security & Configuration Tips
- Never hardcode or log `GEMINI_API_KEY`. Ensure `.env.local` stays local and `.gitignore` continues to exclude it.
- Avoid committing real case data; sanitize examples used for demos or debugging.*** End Patch" }}})​
