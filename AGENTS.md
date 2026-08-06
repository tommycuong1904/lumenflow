<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LumenFlow Agent Guide

## Project documents

- `docs/challenge.md` — official Stellar White Belt requirements; do not modify
- `docs/project-brief.md` — concise project context and architecture
- `docs/progress.md` — current implementation status and remaining work

## Read before each task

1. Read `docs/project-brief.md`.
2. Read `docs/progress.md`.
3. Read `docs/challenge.md` only when validating or clarifying an official requirement.
4. Read only the source files required for the current task.

## Project objective

Build a submission-ready Stellar White Belt application that:

- connects and disconnects Freighter
- reads the connected account's XLM balance from Stellar Testnet
- sends XLM transactions on Stellar Testnet
- clearly shows success, failure, and transaction confirmation
- builds successfully and is ready for public deployment

## Working principles

- Keep scope limited to Level 1 / White Belt requirements.
- Prefer simple and explicit code over abstraction-heavy patterns.
- Treat Horizon Testnet as the default read and submission API.
- Treat Freighter as the primary wallet.
- Keep technical repository documentation in English.
- Keep code, identifiers, and code comments in English.
- Do not add unrelated features unless explicitly requested.

## Architecture direction

- Next.js App Router frontend-only application
- one main page for wallet, balance, and payment flow
- shared Stellar helpers under `src/lib/stellar/`
- presentational components under `src/components/`

## Important constants

- Horizon Testnet: `https://horizon-testnet.stellar.org`
- Friendbot: `https://friendbot.stellar.org/?addr=<PUBLIC_KEY>`
- Network passphrase: `Networks.TESTNET`

## Agent efficiency rules

### File access

- Never scan or recursively inspect the entire repository unless explicitly requested.
- Read only the files required for the current task.
- Use targeted file searches instead of broad repository scans.
- If more than five source files are required, list them first and explain why before opening additional files.
- Do not reopen unchanged files during the same task unless verification is required.

### Implementation

- Modify only files directly related to the current task.
- Make the smallest correct implementation.
- Prefer small targeted edits over full-file rewrites.
- Do not regenerate working code unnecessarily.
- Do not perform unrelated refactoring, cleanup, or formatting.
- Do not implement additional features unless explicitly requested.

### Validation

- Prefer targeted validation over full-project validation.
- Run production builds only after completing a feature or when explicitly requested.
- Do not rerun unchanged failing commands repeatedly.

### Documentation

- Read `docs/challenge.md` only when an official requirement needs clarification.
- Read Stellar or Freighter documentation only when API behavior must be verified.
- Prefer official Stellar, Freighter, and installed Next.js documentation.

### Responses

- Keep responses concise.
- Report only:
  - result
  - files changed
  - validation performed
  - remaining blockers, if any
- Do not explain unchanged code unless requested.

## Next.js rules

- Follow the generated Next.js agent rules at the top of this file.
- Before using a Next.js API, read the relevant guide under `node_modules/next/dist/docs/`.
- Do not rely on remembered Next.js conventions when installed documentation differs.

## Progress tracking

After completing a meaningful task, update `docs/progress.md` with:

- what was completed
- files changed
- validation or tests performed
- remaining work
- known issues or blockers

Do not modify `docs/challenge.md`.

## Task workflow

For every new task:

1. Read `docs/project-brief.md`.
2. Read `docs/progress.md`.
3. Determine the smallest implementation scope.
4. List required files before opening additional source files.
5. Implement only the requested feature.
6. Validate only the affected functionality.
7. Update `docs/progress.md`.
8. Stop and wait for the next instruction.

Do not automatically continue with the next feature.

## Command rules

- Do not install, remove, or upgrade dependencies unless explicitly requested.
- Do not delete files unless explicitly requested.
- Do not modify project structure unless required by the current task.
- Avoid unnecessary terminal commands.
- Do not run the development server unless runtime verification is required.
- Do not run the production build after every small edit.
- Do not repeat the same failing command without first changing the relevant code or configuration.

## Security

- Never expose API keys, private keys, seed phrases, recovery phrases, or secrets.
- Never print or include `.env` values in responses or logs.
- Only reference environment variable names when required.
- Never hardcode secrets into source code.
- Do not read `.env` files unless the current task specifically requires checking environment variable names.
- Client-side code may use only explicitly public environment variables.

## Expected deliverables

- working production build
- Freighter connect and disconnect flow
- XLM balance display
- XLM payment flow on Testnet
- clear success and failure feedback
- transaction hash or confirmation message
- repository documentation suitable for future AI sessions
- submission-ready README and screenshots