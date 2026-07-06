# Repository Guidelines

Contributor guide for **Eburon AI API Documentation** — a React + Vite playground and Express-backed proxy layer that exposes an OpenAI-compatible local AI API (Eburon/Ollama) with Firebase authentication and per-user token quotas.

## Project Structure & Module Organization

```
server.ts              # Express server: auth, API-key store, AI proxy, token-quota enforcement
index.html             # Vite entry HTML
src/
  main.tsx             # React bootstrap
  App.tsx              # Routes, navigation, layout
  index.css            # Tailwind entry
  pages/               # Documentation/playground pages (grouped under capabilities/ and translation/)
  components/          # Shared UI (e.g. CodeBlock.tsx)
  context/AuthContext.tsx   # Firebase auth provider/hook
  lib/firebase.ts      # Firebase client init
  data/languages.ts    # Static reference data
  types.d.ts           # Ambient/global types
data/                  # Runtime JSON store (api-keys.json) — created on first run, not committed
dist/                  # Build output (gitignored)
assets/                # Static assets
```

The `@/*` path alias maps to the repository root (e.g. `@/src/lib/firebase`).

## Build, Test, and Development Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run dev` | Run `server.ts` via `tsx` (Vite dev server + Express API). |
| `npm run build` | `vite build` the client, then `esbuild` bundles `server.ts` to `dist/server.cjs`. |
| `npm start` | Serve the production build via `node dist/server.cjs`. |
| `npm run lint` | Type-check with `tsc --noEmit` (no emitted JS). |
| `npm run clean` | Remove `dist/` and stray `server.js`. |

There is no automated test suite; verify changes by running `npm run dev` and exercising the affected route.

## Coding Style & Naming Conventions

- TypeScript everywhere (target ES2022, `react-jsx`). Use `type`-only imports for types (`import type { ... }`).
- React 19 with function components. Prefer **named exports** for pages (`export function Overview`); a few use default exports (`Login`, `Dashboard`).
- Styling via Tailwind CSS 4 (`@tailwindcss/vite`); compose classes with `clsx`/`tailwind-merge` (see `cn` in `CodeBlock.tsx`).
- Keep server logic in `server.ts`; add new client pages under `src/pages/` (group capability/translation pages into their subfolders) and register routes in `src/App.tsx`.
- Run `npm run lint` before committing — it must pass with no type errors.

## Configuration & Security Tips

- Copy `.env.example` to `.env.local` and set `EBURON_API_KEY`, `EBURON_BASE_URL`, and `OLLAMA_BASE_URL`. Never commit `.env.local` (covered by `.gitignore`).
- The server stores issued API keys and token usage in `data/api-keys.json`; treat this file as runtime state, not source.
- Do not hard-code new secrets in `server.ts` or `src/lib/firebase.ts`; read them from environment variables instead.

## Commit & Pull Request Guidelines

- There is no established Git history convention yet; write clear, imperative commit messages (e.g. `Add image translation playground page`).
- PRs should: summarize the change, reference any related issue, note manual testing steps performed against `npm run dev`, and attach screenshots for UI changes.
- Ensure `npm run lint` passes and the production build succeeds before requesting review.
