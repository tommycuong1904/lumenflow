# LumenFlow Project Brief

## Goal
Build LumenFlow into a Level 2 Stellar Testnet app that can:
- connect supported Stellar wallets
- display XLM balance on Testnet
- keep native XLM transfer working
- create and read Payment Intent records through a deployed smart contract
- show clear pending/success/failure states for wallet-signed contract transactions

## Product framing
LumenFlow is a focused Stellar Testnet payment app evolving from a simple native-transfer MVP into a multi-wallet + contract-backed payment tracker.

## Stable architecture
- Next.js App Router frontend-first application
- one main page for wallet, balance, transfer mode, and transaction feedback
- shared Stellar helpers under `src/lib/stellar/`
- contract scaffold under `contracts/payment-intent/`
- presentational components under `src/components/`
- native transfer remains available alongside the live contract mode path

## In scope
- multi-wallet connection foundation
- Testnet-only UX
- funded/unfunded account handling
- XLM balance display
- native XLM payment flow
- Payment Intent contract deploy on Stellar Testnet
- contract-mode frontend invoke/read flow
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
- contract crate builds/checks successfully
- contract deploys to Stellar Testnet
- contract ID is stored in frontend config
- contract-mode invoke/read flow works from the frontend
- pending/success/failure states render clearly
- live website wallet test succeeds

## Current known state
- native transfer is live
- contract mode is live in code against the deployed testnet contract
- wallet connect was re-verified after clearing a stale preview process
- contract mode tested successfully on the live website flow

## Official requirements
`docs/challenge.md` remains the requirement source when challenge wording matters.
