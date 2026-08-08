# Contract Deploy Checklist

Use this immediately after `stellar-cli` finishes installing.

## Goal
Deploy `contracts/payment-intent` to Stellar Testnet, capture the contract ID, then wire it into the frontend.

## Preconditions
- `stellar-cli` is installed and callable
- Rust toolchain is available
- project root: `/root/lumenflow`
- contract crate: `/root/lumenflow/contracts/payment-intent`

## Expected outputs
- compiled contract WASM path
- deployed contract ID
- at least one example transaction hash after frontend wiring

## Step Order
1. Confirm CLI install
2. Build contract WASM
3. Prepare testnet identity / account
4. Deploy contract to Stellar Testnet
5. Save contract ID into frontend env
6. rebuild / restart app
7. verify contract-mode UI path
8. capture proof artifacts

## Commands To Run Next
From `/root/lumenflow/contracts/payment-intent`:

```bash
stellar --version
cargo build --target wasm32v1-none --release
```

Then locate the WASM under the release target directory and deploy with Stellar Testnet CLI commands appropriate to the installed CLI version.

## After Deploy
Write these values down immediately:
- contract ID:
- deployer/public key:
- network: Stellar Testnet
- example tx hash:

Update frontend env:

```bash
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_PAYMENT_INTENT_CONTRACT_ID=<DEPLOYED_CONTRACT_ID>
```

## App Verification After Wiring
- contract mode can be selected
- contract mode no longer shows blocked-preview messaging
- payment intent path shows pending/success/failure states clearly
- build still passes
- preview URL still loads successfully

## Notes
- Native XLM transfer must remain stable while contract mode is added.
- Do not claim contract mode is live until contract ID wiring and real verification are complete.
