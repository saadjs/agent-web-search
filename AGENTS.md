# Repository Guidelines

## Project Structure & Module Organization

This Vite React app builds and previews web search request payloads.

- `src/main.tsx`, `src/router.tsx`, and `src/routes/` define TanStack Router entrypoints.
- `src/components/` contains feature UI; `src/components/ui/` contains reusable primitives.
- `src/lib/` contains request builders, provider blocks, presets, snippets, mocks, and shared types.
- `src/lib/*.test.ts` contains Vitest unit tests.
- `public/` stores static assets. `dist/` is generated build output and should not be edited manually.
- `src/routeTree.gen.ts` is generated; avoid hand-editing it.

## Build, Test, and Development Commands

- `pnpm install` installs dependencies from `pnpm-lock.yaml`.
- `pnpm run dev` starts Vite on port `3000`.
- `pnpm run build` creates a production build in `dist/`.
- `pnpm run preview` serves the production build locally.
- `pnpm run test` runs Vitest once.
- `pnpm run typecheck` runs TypeScript with `--noEmit`.
- `pnpm run lint` runs ESLint.
- `pnpm run format` formats TS/JS files with Prettier and the Tailwind plugin.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and the `@/` import alias. Follow the current style: two-space indentation, double quotes, no semicolons, and Tailwind utility classes in JSX. Prefer PascalCase for components, camelCase for functions and variables, and kebab-case for route or asset filenames.

Always use shadcn components in `src/components/ui/` for UI controls and layout primitives. Do not hand-roll custom UI primitives when a shadcn component fits; add or adapt shadcn components instead. Put provider-specific request behavior under `src/lib/blocks/` or nearby `src/lib/` modules.

## Testing Guidelines

Vitest is the unit test runner. Name tests `*.test.ts` or `*.test.tsx` and colocate them with the code they cover. Focus on request-building behavior, data transforms, and regressions. For user-reported bugs, add one or two useful regression tests, then run `pnpm run test`.

## Commit & Pull Request Guidelines

Always use Git atomic commits when committing. Use Conventional Commit messages, matching the existing history, for example `feat: add provider controls`, `fix: normalize domain parsing`, or `docs: update builder guide`. Do not mix unrelated feature, refactor, formatting, or documentation work. Never add `Co-Authored-by` trailers.

Pull requests should include a short summary, linked issue when applicable, test results, and screenshots or recordings for visible UI changes. Note generated files, such as route tree updates.
