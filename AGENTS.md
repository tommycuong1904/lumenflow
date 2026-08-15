<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LumenFlow Agent Guide

## Canonical project docs
- `docs/challenge.md` — immutable Stellar White Belt source of truth; do not modify
- `docs/project-brief.md` — compact permanent project context
- `docs/progress.md` — compact current state and blockers
- `docs/reference-starter-template.md` — optional bonus/rubric reference only

## Default loading
- Read `docs/project-brief.md` only when the task depends on project scope, architecture, or product behavior.
- Read `docs/progress.md` only when current status, blockers, branch/repo state, or submission readiness matters.
- Read `docs/challenge.md` only when validating an official requirement.
- Read `docs/reference-starter-template.md` only when the user asks about bonus features, scoring, or scope expansion.
- Read only the source files needed for the current task.

## Lightweight task routing
- Support these short aliases at the start of a user task:
  - `bug:` — fix broken behavior
  - `ui:` — visual, layout, or styling change
  - `feature:` — add a new capability or flow
  - `investigate:` — diagnose or find root cause
  - `review:` — audit without edits unless explicitly requested
  - `release:` — pre-submission verification
- Treat everything after the alias as the task instruction.
- Accept Vietnamese or English instructions without asking for translation.
- Infer the smallest relevant scope from the existing implementation.
- Inspect the nearest existing implementation before editing.
- Prefer existing project patterns over introducing new ones.
- Do not output an implementation plan for routine tasks unless requested.
- Ask for clarification only when a missing decision would materially change the result.
- Do not suggest additional work when the requested task is already complete.

## Project constraints
- Keep scope aligned with Stellar White Belt / Level 1 unless the user explicitly expands it.
- Preserve the current architecture: Next.js App Router frontend-only app, one main flow, shared Stellar helpers under `src/lib/stellar/`, presentational UI under `src/components/`.
- Freighter is the primary wallet.
- Horizon Testnet is the default read/submission API.
- Keep technical docs, code, identifiers, and comments in English.
- Do not change application behavior unless requested.

## Efficiency rules
- Use targeted file reads/searches; do not scan the whole repo unless requested.
- Modify only files directly related to the task.
- Prefer the smallest correct edit over broad rewrites.
- Avoid unnecessary installs, refactors, cleanup, formatting, and repeated failing commands.
- Prefer targeted validation; run full production builds only after meaningful changes or when requested.
- Do not reread unchanged files during the same task unless a specific detail must be re-verified.

## Documentation rules
- Update `docs/progress.md` after meaningful project changes.
- Do not modify `docs/challenge.md`.
- Prefer concise responses by default: result, files changed, validation, blockers.
- Do not explain implementation details or paste applied code unless requested.

## Git & Version Control rules
- **User review before Git actions**: After creating, modifying, or deleting files, ALWAYS stop and present the changes for user review and validation.
- **Do not auto-commit or push**: Never run `git commit`, `git merge`, or `git push` without explicit confirmation or request from the user.

## Security
- Never expose secrets, seed phrases, private keys, or `.env` values.
- Do not read `.env` files unless the task specifically requires environment variable names.
- Client code may use only explicitly public environment variables.