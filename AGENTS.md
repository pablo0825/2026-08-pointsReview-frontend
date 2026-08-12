# Repository Guidelines

## Project Structure & Module Organization

This React, TypeScript, Vite, and Tailwind CSS application uses `docs/project/` as the authority for requirements and architecture. `docs/blueprint/` tracks feature slices; records live in `docs/specs/<ID>/`, `docs/plans/<ID>/`, and `docs/verification/<ID>/`. `docs/archive/` is historical only.

`src/app/` owns routing and providers. Domain code belongs in `src/features/<feature>/`; shared infrastructure belongs in `src/shared/`. MSW setup and fixtures live in `src/test/`; browser tests live in `e2e/`. Keep schemas, mappers, queries, components, and tests with their feature.

## Build, Test, and Development Commands

- `npm ci` — install locked dependencies.
- `npm run dev` — start Vite locally.
- `npm run typecheck` — run strict TypeScript checks.
- `npm run lint` — run ESLint.
- `npm run test` / `npm run test:watch` — run Vitest once or in watch mode.
- `npm run build` / `npm run preview` — build or preview production output.
- `npm run test:e2e` — run Playwright with a managed Vite server.

Before a code PR, run typecheck, lint, tests, build, and relevant E2E tests. For docs-only changes, run `git diff --check` and use `rg "<term>" docs`.

## Coding Style & Naming Conventions

Write project documentation in Chinese; keep paths, APIs, IDs, slugs, commands, and identifiers in English. Use kebab-case files, PascalCase components, camelCase functions/variables, and `FS-NNN` slice IDs. Match two-space indentation, single quotes, and extension-free imports. ESLint is enforced; no formatter is configured. Keep TypeScript strict, validate API responses with Zod, and calculate points in integer minor units.

## Testing Guidelines

Name colocated Vitest files `*.test.ts` or `*.test.tsx` and browser tests `e2e/*.spec.ts`. Use Testing Library for user-visible behavior and MSW for API states; reset handlers after each test. Cover calculations, schemas, permissions, state transitions, failures, keyboard use, and 360px layouts. Never use real personal data in fixtures.

## Commit & Pull Request Guidelines

Use scoped Conventional Commits, matching history: `feat(rules): ...`, `fix(rules): ...`, and `docs(FS-002): ...`. Keep commits atomic and separate docs, dependencies, and features. PRs must identify the Feature Slice, summarize behavior and contract changes, link its approved Spec/Plan or issue, list checks run, and include screenshots for UI changes.

## Security & Workflow

Never log or persist session tokens, signatures, attachments, or student data in browser storage or URLs. Follow the repository feature-slice workflow: project requirements → blueprint → Spec → Plan → implementation → verification → human acceptance. Do not begin implementation before explicit Spec and Plan approval.
