# LumenFlow Progress Tracker

## Current Status
Payment-intent flow remains live and verified, and Level 3 escrow-vault is now deployed, locally wired, and live-verified on branch `feat/level3-foundation` with passing Rust/frontend builds.

## Current State
- Working branch: `feat/level3-foundation`
- Multi-wallet foundation is integrated.
- Native XLM transfer flow remains live.
- Payment Intent contract is deployed to Stellar Testnet.
- Frontend contract mode is wired to the live invoke/read flow.
- Vercel production now has the required public contract env vars.
- Contract mode was re-verified on the public Vercel app after env setup.
- Wallet session restore after `F5` now keeps the connected state without reopening the wallet picker.
- New `contracts/escrow-vault/` crate now has create/release/refund/get/count flows with 6 passing tests.
- Home page now includes a read-only escrow vault status card backed by `get_escrow_count` when `NEXT_PUBLIC_ESCROW_VAULT_CONTRACT_ID` is configured.
- The escrow read card now also fetches and displays the latest readable escrow record via `get_escrow(id)` when count > 0.
- Payment form now includes an `Escrow mode` path that builds and signs `create_escrow` contract invocations from the existing recipient / amount / memo fields.

## Deployment Artifacts
- Payment Intent contract ID: `CBAEFZC6GIYE5H7ZDN3JVHH3TDAWBP5VGZCWWH4TDANWUIE2GXQWAGHO`
- Payment Intent alias: `payment-intent-level2`
- Escrow vault contract ID: `CDY4BP6KMWEUSHRJFIBZVJW2TQN3BAX2VB3FAH6XCKDRDNVUJFJ6EDIQ`
- Escrow vault alias: `escrow-vault-level3`
- Deployer public key: `GBBSRCJ7LU46KMCJKEZBX4ZKVHEQYWRBCJ7XTXJGJRWTXL226QGK5PME`
- Payment Intent deploy tx: `1d910b784a363a499c23265397cddbbcba77540e25f9d72ec9c440dced40401e`
- Escrow vault upload hash: `b9034a4b221c092611f5b4de086ecb43f3e253edca8a9514748f8f51cd971d6e`
- Escrow vault deploy tx: `2c1fb056b52934f39a047a2fb0174978afcb1ba22d3ba8dcb4c3e4acb60b0005`
- Escrow vault live verify create tx: `d1ea87d8b006fcfd8bb1e62f7eaeeb9f9642eb1ed28c0cb3ee3751ce06c2a92d`

## Validation Snapshot
- App production build passes (`npm run build`).
- TypeScript check passes (`npx tsc --noEmit`).
- Escrow vault contract builds for `wasm32v1-none` in release mode.
- Escrow vault Rust tests pass (`cargo test` -> 6 passed).
- Native transfer flow remains preserved.
- Contract-mode frontend invoke/read wiring is build-verified.
- Escrow vault frontend count + latest-record read wiring is build-verified.
- Escrow mode frontend write-foundation wiring is build-verified.
- Escrow vault contract is now deployed on Stellar Testnet and wired into local frontend env.
- Live escrow verify now passes end-to-end for create + count + detail read on the redeployed Level 3 contract.
- UI copy now reflects escrow as a live Testnet path rather than a foundation placeholder.
- Public deployment is still pending separate Vercel credentialed sync; local/live contract state is ahead of the public site.
- Footer copy and links now reflect the live escrow path, dual contract explorers, and Level 2 + Level 3 state.
- Native-mode readiness copy now correctly says Horizon Testnet is used directly instead of implying a contract is connected.
- Escrow read card now uses a dedicated loading message before showing empty-state guidance.
- Escrow review state now has dedicated pre-signing copy instead of falling back to native payment wording.
- Escrow signed transactions now submit through the Soroban contract RPC path instead of the native Horizon submit helper.
- Transaction result card now labels escrow mode and escrow IDs correctly.
- Submit review now blocks contract/escrow modes with explicit setup errors if required public env config is missing.
- Contract/escrow result handling now treats non-SUCCESS Soroban transaction status as an error instead of reporting success from hash-only submission; shared helper keeps both branches consistent.
- Transaction state now uses a generic `onchainRecordId` field so escrow IDs are not stored under payment-intent naming, result-card labels are centralized by mode, and result-card copy now covers native/contract/escrow flows.
- Local app endpoint responds successfully on port 3002 (`HTTP/1.1 200 OK`).
- Public Vercel deployment was checked directly to confirm contract mode enablement after env setup.
- Wallet connect was confirmed working again on the live website.
- Contract mode was confirmed working in live website testing.
- Refreshing after wallet connect no longer reopens wallet options or drops the UI into a disconnected prompt state.

## Blockers
- No current code blocker for Level 2 core flow.
- Only optional polish / docs / packaging work remains.

## Branch / Repo State
- Base branch: `main`
- Active local branch: `feat/level3-foundation`
- Remote remains intentionally behind Level 3 local work until explicitly pushed.
- Latest verified fix on remote: `75c922e` (`fix: restore wallet session without reopening picker`)

## Remaining Work
- Optional UI/copy polish based on real usage.
- Optional final documentation cleanup.
- Optional submission packaging / checklist refresh.

## Scope Notes
- Native transfer remains stable alongside the live Level 2 contract path.
- `docs/challenge.md` remains the requirement source.
