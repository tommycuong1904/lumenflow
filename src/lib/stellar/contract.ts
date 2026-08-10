import { SOROBAN_RPC_URL } from "./constants";

export const PAYMENT_INTENT_CONTRACT_ID = process.env.NEXT_PUBLIC_PAYMENT_INTENT_CONTRACT_ID ?? "";
export const ESCROW_VAULT_CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_VAULT_CONTRACT_ID ?? "";
export const PAYMENT_INTENT_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? SOROBAN_RPC_URL;

export type PaymentIntentStatus = "pending" | "completed" | "cancelled";

export type PaymentIntentMode = "native_transfer" | "contract";

export type PaymentIntentRecord = {
  id: string;
  creator: string;
  recipient: string;
  amount: string;
  status: PaymentIntentStatus;
};

export type CreatePaymentIntentInput = {
  recipient: string;
  amount: string;
};

export function isPaymentIntentContractConfigured() {
  return PAYMENT_INTENT_CONTRACT_ID.trim().length > 0;
}

export function getPaymentIntentConfig() {
  const contractId = PAYMENT_INTENT_CONTRACT_ID.trim();
  const rpcUrl = PAYMENT_INTENT_RPC_URL.trim();

  return {
    contractId,
    rpcUrl,
    ready: contractId.length > 0 && rpcUrl.length > 0,
  };
}

export function getEscrowVaultConfig() {
  const contractId = ESCROW_VAULT_CONTRACT_ID.trim();
  const rpcUrl = PAYMENT_INTENT_RPC_URL.trim();

  return {
    contractId,
    rpcUrl,
    ready: contractId.length > 0 && rpcUrl.length > 0,
  };
}
