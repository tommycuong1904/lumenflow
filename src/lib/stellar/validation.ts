import { StrKey } from "@stellar/stellar-sdk";

export function isValidPublicKey(address: string): boolean {
  return StrKey.isValidEd25519PublicKey(address.trim());
}

export function isValidAmount(amount: string): boolean {
  if (!amount.trim()) return false;
  const value = Number(amount);
  return Number.isFinite(value) && value > 0;
}
