# LumenFlow — Stellar Testnet Payment App

LumenFlow is a simple Stellar Testnet dApp built for the Stellar White Belt challenge. It focuses on the core Level 1 requirements:

- connect a Freighter wallet
- display the connected wallet's XLM balance
- send a native XLM payment on Stellar Testnet
- show success or failure feedback after transaction submission

## Current Status

The app is implemented, polished, and builds successfully for production preview.

What is complete:
- Freighter connection flow in the UI
- Testnet-only wallet/network checks
- Horizon-based XLM balance lookup
- native XLM payment transaction creation
- explicit **transaction confirmation step** before signing
- Freighter signing flow integration
- transaction submission flow and feedback UI
- clean error, loading, and disabled states
- responsive layout for mobile and desktop

What is pending for submission:
- final manual verification in a browser that has the Freighter extension installed
- final screenshot capture (`docs/screenshots/`)

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
- Transaction hash is shown after successful submission with a link to Stellar Expert

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

## Screenshots for Submission

Add screenshots under:

```text
docs/screenshots/
```

Checklist and naming guide:

```text
docs/screenshots/README.md
```

Recommended required files:
- `01-wallet-connected.png`
- `02-balance-displayed.png`
- `03-send-form-filled.png`
- `04-transaction-success.png`

## Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    BalanceCard.tsx
    SendPaymentForm.tsx
    TxResultCard.tsx
    WalletCard.tsx
  lib/
    stellar/
      constants.ts
      horizon.ts
      submit.ts
      transactions.ts
      types.ts
      validation.ts
      wallet.ts
    utils/
      format.ts

docs/
  project-brief.md
  progress.md
  screenshots/
```

## Notes

- The current verification environment used during development did not include the Freighter browser extension, so final end-to-end manual verification must be completed in a Freighter-enabled browser.
- This project intentionally keeps scope tight to White Belt / Level 1 requirements.
- Future expansion can build on the same `LumenFlow` product line if later challenge levels allow it (e.g. evolving into a Payment Tracker or Approval-to-Settlement Workflow).
