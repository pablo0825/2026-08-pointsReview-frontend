# Repository Guidelines

## Project Structure & Module Organization

This repository is documentation-first; application source and package scripts have not been scaffolded. Treat `docs/project/` as authoritative for requirements, architecture, API contracts, and quality standards. `docs/blueprint/` contains the feature-slice index and briefs; create approved specifications in `docs/specs/<ID>/` and plans in `docs/plans/<ID>/`. Discussion context belongs in `docs/notes/`; `docs/archive/` is historical only.

The planned application layout is feature-oriented: `src/app/` for routing and providers, `src/features/` for domain modules, `src/shared/` for genuinely cross-feature code, and `src/test/` for shared test infrastructure. Keep feature-specific schemas, mappers, queries, components, and tests within their feature.

## Build, Test, and Development Commands

No `package.json` or runnable frontend exists yet, so no install, dev, build, lint, or test commands are valid. For documentation-only changes, use:

- `git diff --check` — detect whitespace errors.
- `rg "<term>" docs` — check terminology and cross-document consistency.

When tooling is added, document scripts for development, type-checking, linting, tests, and production builds.

## Coding Style & Naming Conventions

Write project documentation in Chinese, while keeping file names, paths, API names, IDs, slugs, commands, and code identifiers in English. Use kebab-case for document slugs and the fixed `FS-NNN` format for slice IDs. Follow the architecture in `docs/project/frontend-architecture.md`: TypeScript/React, feature-local ownership, Zod-validated API responses, integer minor units for point calculations, and no unnecessary global state. Prefer small, reviewable changes over speculative abstractions.

## Testing Guidelines

Use Vitest for units, Testing Library plus MSW for components/integration, and Playwright for critical browser flows. Prioritize calculations, schemas, mappers, permissions, state transitions, and API failures. Each feature must cover loading, empty, error, success, and unauthorized states, plus keyboard use and 360px layouts. Never use real personal data in fixtures.

## Commit & Pull Request Guidelines

Use Conventional Commits, matching history: `docs(blueprint): define feature slices`, `feat: add ...`. Keep commits atomic and separate documentation, infrastructure, and feature work. PRs should identify the Feature Slice, summarize behavior and contract changes, link the approved Spec/Plan or issue, list verification performed, and include screenshots for visible UI changes. Update affected project documents when requirements or contracts change.

## Security & Workflow

Never log or persist session tokens, signatures, attachments, or student data in browser storage or URLs. Follow the repository feature-slice workflow: project requirements → blueprint → Spec → Plan → implementation → verification → human acceptance. Do not begin implementation before explicit Spec and Plan approval.
