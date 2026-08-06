# LumenFlow — Stellar Testnet Payment App

LumenFlow is a simple Stellar Testnet dApp built for the Stellar White Belt challenge. It focuses on the core Level 1 requirements:

- connect a Freighter wallet
- display the connected wallet's XLM balance
- send a native XLM payment on Stellar Testnet
- show success or failure feedback after transaction submission

## Current Status

The app is implemented, polished, verified end-to-end with a real Freighter wallet on Stellar Testnet, and ready for submission.

What is complete:
- Freighter connection flow in the UI, with session persistence across page refresh / new tab (silently restores the connection instead of re-prompting, as long as Freighter access hasn't been revoked)
- Testnet-only wallet/network checks
- Horizon-based XLM balance lookup
- native XLM payment transaction creation
- explicit **transaction confirmation step** before signing
- Freighter signing flow integration
- transaction submission flow and feedback UI, with a full receipt (Status, Tx hash, Amount, Recipient, Memo, Stellar Expert link)
- Address Book: save/label/reuse frequent recipient addresses via `localStorage`, with auto-save of the recipient after a successful send
- clean error, loading, and disabled states
- responsive layout for mobile and desktop
- Dark/Light mode, wallet address QR code, and UI animation polish (bonus scope)

Manual verification and screenshot capture are both complete — see below.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- `@stellar/stellar-sdk`
- `@stellar/freighter-api`

## Requirements Coverage

### 1. Wallet Setup
- Freighter wallet is the intended wallet target
- App is built specifically for Stellar Testnet

### 2. Wallet Connection
- Connect wallet flow is implemented
- Disconnect flow is implemented in the UI state
- Copy address utility is provided

### 3. Balance Handling
- Connected wallet XLM balance is fetched from Horizon Testnet
- Balance is displayed in the UI
- Unfunded account state is handled with a Friendbot prompt

### 4. Transaction Flow
- Native XLM payment transaction is created with Stellar SDK
- Explicit review/confirmation step precedes signing
- Transaction is signed through Freighter
- Signed transaction is submitted to Stellar Testnet
- Success or failure feedback is shown in the UI
- Full receipt shown after successful submission: Status, Tx hash, Amount, Recipient, Memo (when provided), and a link to Stellar Expert

### 5. Bonus Features
- Dark/Light mode toggle (persisted via `next-themes`)
- QR code for the connected wallet address
- Entrance/transition animations across the main UI sections
- Address Book: save frequently used recipient addresses with a label, reuse them with one click, remove them, and auto-save the recipient after every successful send — all stored client-side in `localStorage`
- Wallet session persistence: staying connected across a page refresh or a new tab, without needing to click Connect again (Freighter only re-prompts if access was actually revoked)

## Local Setup

### Prerequisites
- Node.js 18+ recommended
- npm
- Freighter browser extension

### Install

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Default Next.js local URL:

```text
http://localhost:3000
```

Current workspace note:

```text
LumenFlow is accessible for production-style preview via IP at http://156.67.24.44:3002/ 
(Port 3001 is reserved for SettleFlow).
```

### Production build

```bash
npm run build
npm run start
```

## How to Use

1. Open LumenFlow in a browser with Freighter installed.
2. Switch Freighter to Stellar Testnet.
3. Connect the wallet.
4. If the account is unfunded, use Friendbot.
5. Confirm the XLM balance is visible.
6. Enter a recipient address and amount.
7. Sign the transaction in Freighter.
8. Wait for the transaction result and hash.

## Testnet Notes

### Horizon endpoint
```text
https://horizon-testnet.stellar.org
```

### Friendbot
```text
https://friendbot.stellar.org/?addr=<PUBLIC_KEY>
```

## Screenshots

All captured with a real Freighter wallet connected on Stellar Testnet.

### Core flow

| Wallet connected | Balance displayed |
|---|---|
| ![Wallet connected](docs/screenshots/01-wallet-connected.png) | ![Balance displayed](docs/screenshots/02-balance-displayed.png) |

| Send form filled | Transaction success |
|---|---|
| ![Send form filled](docs/screenshots/03-send-form-filled.png) | ![Transaction success](docs/screenshots/04-transaction-success.png) |

### Additional states

| Friendbot / unfunded state | Wallet disconnected state |
|---|---|
| ![Friendbot unfunded state](docs/screenshots/05-friendbot-unfunded-state.png) | ![Wallet disconnected state](docs/screenshots/06-wallet-disconnected-state.png) |

### Bonus features

| Dark / Light mode | Wallet QR code | Address Book |
|---|---|---|
| ![Dark and light mode](docs/screenshots/07-dark-light-mode.png) | ![Wallet QR code](docs/screenshots/08-wallet-qr-code.png) | ![Address Book](docs/screenshots/09-address-book.png) |

Full checklist and naming guide: [`docs/screenshots/README.md`](docs/screenshots/README.md)

## Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    AddressBook.tsx
    BalanceCard.tsx
    SendPaymentForm.tsx
    ThemeToggle.tsx
    TxResultCard.tsx
    WalletCard.tsx
    WalletQrCode.tsx
    ui/
      alert.tsx
      badge.tsx
      button.tsx
      card.tsx
      input.tsx
      label.tsx
      separator.tsx
      textarea.tsx
  lib/
    stellar/
      addressBook.ts
      constants.ts
      horizon.ts
      submit.ts
      transactions.ts
      types.ts
      validation.ts
      wallet.ts
    utils/
      format.ts
    utils.ts

docs/
  project-brief.md
  progress.md
  reference-starter-template.md
  screenshots/
```

## Notes

- Manual end-to-end verification was completed with a real Freighter extension on Stellar Testnet (connect, balance, copy address, QR code, send payment, receipt fields, Address Book, session persistence) — all checks passed.
- This project intentionally expanded beyond strict White Belt / Level 1 minimums to pick up bonus points (see `docs/project-brief.md` and `docs/reference-starter-template.md`), while keeping the core Stellar/Freighter logic untouched.
- Future expansion can build on the same `LumenFlow` product line if later challenge levels allow it (e.g. evolving into a Payment Tracker or Approval-to-Settlement Workflow).

## Repository

https://github.com/tommycuong1904/lumenflow
