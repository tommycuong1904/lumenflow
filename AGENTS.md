<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LumenFlow Agent Guide

## Read first
1. `docs/project-brief.md`
2. `docs/progress.md`
3. This file
4. Relevant Stellar docs collected during the session

## Project objective
Build a submission-ready Stellar White Belt app that:
- connects Freighter
- reads XLM balance from Stellar Testnet
- sends XLM on Testnet
- shows transaction feedback clearly

## Working principles
- Keep scope tight to Level 1 / White Belt.
- Prefer simple, explicit code over abstraction-heavy patterns.
- Treat Horizon Testnet as the default read/submit API.
- Treat Freighter as the primary wallet target.
- Keep technical repo docs in English.
- Keep code and code comments in English.

## Architecture direction
- Next.js App Router frontend-only app
- one main page for wallet, balance, and payment flow
- shared Stellar helpers under `src/lib/stellar/`
- presentational components under `src/components/`

## Important constants
- Horizon Testnet: `https://horizon-testnet.stellar.org`
- Friendbot: `https://friendbot.stellar.org/?addr=<PUBLIC_KEY>`
- Network passphrase: `Networks.TESTNET`

## Expected deliverables
- working build
- wallet connect/disconnect flow
- balance display
- XLM payment flow
- repo docs good enough for future AI sessions and submission packaging
