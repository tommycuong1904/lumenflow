# LumenFlow Project Brief

## Goal
Build a submission-ready Stellar White Belt / Level 1 app that can:
- connect and disconnect Freighter
- display XLM balance on Stellar Testnet
- send native XLM on Testnet
- show clear success/failure feedback with transaction confirmation details

## Product framing
LumenFlow is a small frontend-only Stellar Testnet payment app focused on a clean wallet → balance → send-payment flow.

## Stable architecture
- Next.js App Router frontend-only application
- one main page for wallet, balance, and payment flow
- shared Stellar helpers under `src/lib/stellar/`
- presentational components under `src/components/`
- Freighter-only wallet scope
- XLM-only payment scope

## In scope
- Freighter connect/disconnect
- Testnet-only UX
- funded/unfunded account handling
- XLM balance display
- XLM payment form
- transaction result state and hash / confirmation
- README and submission screenshots
- bonus UX already implemented: Dark/Light mode, QR code, animations, Address Book, session persistence

## Out of scope
- multiple wallet providers
- non-XLM assets
- transaction history
- smart contracts
- backend/database
- auth
- marketplace or analytics features

## Definition of done
- app builds successfully
- Freighter connection works
- XLM balance renders correctly
- XLM Testnet payment succeeds
- success/failure states render clearly
- submission-ready README and screenshots exist

## Official requirements
`docs/challenge.md` is the immutable source of truth for White Belt requirements. Read it only when requirement wording matters.