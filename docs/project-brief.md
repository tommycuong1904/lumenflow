# LumenFlow Project Brief

## Goal
Build LumenFlow into a Stellar Testnet app that can:
- connect supported Stellar wallets
- display XLM balance on Testnet
- keep native XLM transfer working
- create and read Payment Intent records through a deployed smart contract
- create and read Level 3 escrow records through a deployed smart contract
- show clear pending/success/failure states for wallet-signed contract transactions

## Product framing
LumenFlow is a focused Stellar Testnet payment app evolving from a simple native-transfer MVP into a multi-wallet + contract-backed payment and escrow tracker.

## Stable architecture
- Next.js App Router frontend-first application
- one main page for wallet, balance, transfer mode, escrow read state, and transaction feedback
- shared Stellar helpers under `src/lib/stellar/`
- contract scaffolds under `contracts/payment-intent/` and `contracts/escrow-vault/`
- presentational components under `src/components/`
- native transfer remains available alongside live payment-intent and escrow paths

## In scope
- multi-wallet connection foundation
- Testnet-only UX
- funded/unfunded account handling
- XLM balance display
- native XLM payment flow
- Payment Intent contract deploy on Stellar Testnet
- Escrow vault contract deploy on Stellar Testnet
- contract-mode frontend invoke/read flow
- escrow-mode frontend invoke/read flow
- transaction result state and hash / confirmation
- README / docs updates as work progresses

## Out of scope
- non-XLM assets
- full transaction history
- backend/database
- auth
- marketplace / analytics features
- production mainnet deployment

## Definition of done
- app builds successfully
- multi-wallet connection works
- native XLM flow still works
- contract crates build/check successfully
- contracts deploy to Stellar Testnet
- contract IDs are stored in frontend config
- payment-intent invoke/read flow works from the frontend
- escrow invoke/read flow works locally against Testnet
- pending/success/failure states render clearly
- public website sync is verified separately after credentialed redeploy

## Current known state
- native transfer is live
- payment-intent mode is live in code against the deployed Testnet contract
- escrow mode is live in local code against the deployed Testnet escrow contract
- wallet connect was re-verified after clearing a stale preview process
- payment-intent mode was tested successfully on the public website before the Level 3 local-only branch advanced
- public website still needs a separate redeploy before it reflects escrow mode

## Official requirements
`docs/challenge.md` remains the requirement source when challenge wording matters.
