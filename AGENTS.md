# Repository Guidelines

## Project Structure & Module Organization

This React, TypeScript, Vite, and Tailwind CSS application uses `docs/project/` as the requirements authority. `docs/blueprint/` tracks slices; records live in `docs/specs/<ID>/`, `docs/plans/<ID>/`, and `docs/verification/<ID>/`.

`src/app/` owns the shell. Domain code belongs in `src/features/<feature>/`, split into `api/`, `model/`, and `components/` when useful. Application-only shared code belongs in `src/features/applications/common/`; shared utilities belong in `src/shared/`. MSW infrastructure lives in `src/test/`, Playwright tests in `e2e/`, and Vitest files beside their implementation.

## Build, Test, and Development Commands

- `npm ci` — install locked dependencies.
- `npm run dev` — start Vite locally.
- `npm run typecheck` — run TypeScript checks.
- `npm run lint` — run ESLint.
- `npm run test` / `npm run test:watch` — run Vitest once or in watch mode.
- `npm run build` / `npm run preview` — build or preview production output.
- `npm run test:e2e` — run Playwright with a managed Vite server.

Before a code PR, run typecheck, lint, tests, build, and relevant E2E tests. For docs-only changes, run `git diff --check` and use `rg "<term>" docs`.

## Coding Style & Naming Conventions

Write project documentation in Chinese; keep technical names and identifiers in English. Use kebab-case files, PascalCase components, camelCase functions/variables, and `FS-NNN` slice IDs. Match two-space indentation, single quotes, and extension-free imports. ESLint is enforced; no formatter is configured. Keep TypeScript strict. Use TanStack Query for server state, React Hook Form for forms, Zod for wire and form validation, and integer minor units for points.

## Testing Guidelines

Name Vitest files `*.test.ts` or `*.test.tsx` and browser tests `e2e/*.spec.ts`. Test visible behavior with Testing Library and API states with MSW; unhandled requests must fail and handlers reset after each test. Cover logic, states, failures, keyboard use, and 360px layouts. Never use real personal data in fixtures.

## Commit & Pull Request Guidelines

Use scoped Conventional Commits: `feat(competition): ...`, `fix(testing): ...`, and `docs(FS-004): ...`. Keep commits atomic and separate docs, dependencies, and features. PRs must identify the slice, summarize behavior and contract changes, link its approved Spec/Plan or issue, list checks run, and include screenshots for UI changes.

## Security & Workflow

Never log or persist session tokens, signatures, attachments, or student data in browser storage or URLs. Follow the repository feature-slice workflow: project requirements → blueprint → Spec → Plan → implementation → verification → human acceptance. Do not begin implementation before explicit Spec and Plan approval.
