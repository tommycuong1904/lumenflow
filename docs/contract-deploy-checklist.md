# Contract Deploy Checklist

Use this when syncing Stellar Testnet contracts and frontend env for LumenFlow.

## Goal
Keep both deployed contracts and the frontend in sync:
- `contracts/payment-intent`
- `contracts/escrow-vault`

Then verify local UI and public deployment state separately.

## Preconditions
- `stellar` CLI is installed and callable
- Rust toolchain is available
- project root: `/root/lumenflow`
- payment intent crate: `/root/lumenflow/contracts/payment-intent`
- escrow vault crate: `/root/lumenflow/contracts/escrow-vault`
- local frontend env is editable
- public deploy credentials may be required separately (for Vercel/public sync)

## Current Testnet artifacts
- Payment Intent contract ID: `CBAEFZC6GIYE5H7ZDN3JVHH3TDAWBP5VGZCWWH4TDANWUIE2GXQWAGHO`
- Escrow vault contract ID: `CDY4BP6KMWEUSHRJFIBZVJW2TQN3BAX2VB3FAH6XCKDRDNVUJFJ6EDIQ`
- Escrow vault alias: `escrow-vault-level3`
- Escrow live verify tx: `d1ea87d8b006fcfd8bb1e62f7eaeeb9f9642eb1ed28c0cb3ee3751ce06c2a92d`
- Public demo target: `https://lumenflow-one.vercel.app/`

## Step Order
1. Confirm CLI install
2. Build the target contract WASM
3. Prepare/fund Testnet identity if needed
4. Upload/deploy contract to Stellar Testnet
5. Capture contract ID / alias / tx hash
6. Save contract IDs into local frontend env
7. rebuild and verify local app
8. if public deploy access exists, sync public env/deployment
9. verify public website matches local capabilities

## Core Commands
### Build
```bash
stellar --version
cargo build --target wasm32v1-none --release
```

### Local frontend env
```env
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_PAYMENT_INTENT_CONTRACT_ID=CBAEFZC6GIYE5H7ZDN3JVHH3TDAWBP5VGZCWWH4TDANWUIE2GXQWAGHO
NEXT_PUBLIC_ESCROW_VAULT_CONTRACT_ID=CDY4BP6KMWEUSHRJFIBZVJW2TQN3BAX2VB3FAH6XCKDRDNVUJFJ6EDIQ
```

## Local verification target
- `npm run build` passes
- local app loads on port `3002`
- UI shows:
  - `Contract mode live`
  - `Escrow mode live`
  - escrow read card
  - three payment paths ready copy

## Public verification target
Public deploy is not considered synced until `https://lumenflow-one.vercel.app/` visibly shows:
- `Escrow mode live`
- escrow read card
- updated three-path hero copy
- escrow mode option in payment form

## Notes
- Local env sync and public deploy sync are different steps.
- Do not claim public deployment is updated unless the public site visibly reflects the escrow path.
- If Vercel CLI/token is unavailable, stop at local readiness and report credential blocker explicitly.
