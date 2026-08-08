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
- Read `docs/project-brief.md` for implementation tasks.
- Read `docs/progress.md` only when current status, blockers, branch/repo state, or submission readiness matters.
- Read `docs/challenge.md` only when validating an official requirement.
- Read `docs/reference-starter-template.md` only when the user asks about bonus features, scoring, or scope expansion.
- Read only the source files needed for the current task.

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

## Documentation rules
- Update `docs/progress.md` after meaningful project changes.
- Do not modify `docs/challenge.md`.
- Prefer concise responses by default: result, files changed, validation, blockers.

## Security
- Never expose secrets, seed phrases, private keys, or `.env` values.
- Do not read `.env` files unless the task specifically requires environment variable names.
- Client code may use only explicitly public environment variables.

## Expected deliverable
A submission-ready Stellar White Belt app with wallet connect/disconnect, XLM balance, XLM payment flow, clear transaction feedback, and concise supporting docs.