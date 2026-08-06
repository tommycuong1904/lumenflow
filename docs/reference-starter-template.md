# Reference: Stellar Frontend Starter Template (external, not LumenFlow's own stack)

> Source: README.md shared by user on 2026-07-21, from a *different* starter repo
> (`stellar-frontend-challenge` using Stellar Wallets Kit + Next.js 14).
> LumenFlow does NOT use this template's architecture — LumenFlow is hand-rolled
> with `@stellar/stellar-sdk` + `@stellar/freighter-api` on Next.js 16, per
> `docs/project-brief.md`. This file is kept only as an evaluation-criteria /
> bonus-feature reference the challenge docs recommended looking at.

## Architecture in the reference template (NOT how LumenFlow is built)
- `lib/stellar-helper.ts` — all blockchain logic, marked DO NOT MODIFY
- `components/WalletConnection.tsx`, `BalanceDisplay.tsx`, `PaymentForm.tsx`,
  `TransactionHistory.tsx`, `BonusFeatures.tsx`, `example-components.tsx`
- Uses Stellar Wallets Kit (multi-wallet: Freighter, xBull, Albedo, Lobstr...)
  — LumenFlow intentionally scopes to Freighter only (White Belt / Level 1).

## Evaluation criteria (likely shared rubric shape for the challenge)
- UI/UX Design — 40%
- Code Quality — 30%
- Functionality — 30%

## Bonus features + point values (reference template's list)
- Dark/Light Mode — 10 pts — ✅ LumenFlow has this (`next-themes` + `.light` CSS vars)
- Copy Address — 5 pts — ✅ LumenFlow has this
- QR Code for address — 10 pts — ✅ LumenFlow has this (`qrcode.react`, shown once connected)
- Balance Chart — 15 pts — ⬜ not in LumenFlow
- Search Transactions — 10 pts — ⬜ N/A (LumenFlow has no tx history list, out of scope per brief)
- Multiple Assets — 15 pts — ⬜ explicitly out of scope in LumenFlow brief (XLM only)
- Animations — 10 pts — ✅ LumenFlow has this (entrance/transition animations on main sections)
- Mobile Responsive — 10 pts — ✅ LumenFlow has responsive layout
- Transaction Confirmations — 10 pts — ✅ LumenFlow has explicit review/confirm step before signing
- Address Book — 15 pts — ⬜ not in LumenFlow

## Current bonus score estimate
55/100 achievable points captured (Dark/Light Mode, Copy Address, QR Code, Animations,
Mobile Responsive, Transaction Confirmations). Remaining 45 pts (Balance Chart, Search
Transactions, Multiple Assets, Address Book) are out of scope for White Belt Level 1
per `docs/project-brief.md` — would require deliberate scope expansion + user confirmation.

## Notes for future sessions
- Do NOT assume LumenFlow should adopt this template's file structure or
  Stellar Wallets Kit — that would contradict `docs/project-brief.md` scope
  (Freighter-only, XLM-only, no multi-wallet, no tx history, no multi-asset).
- Treat the bonus list only as optional extra-credit ideas if the user asks
  to extend scope beyond White Belt Level 1. Confirm with user before adding
  any bonus feature, since project-brief.md currently marks most of these
  out of scope.
