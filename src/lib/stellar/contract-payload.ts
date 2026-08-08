import { Address, nativeToScVal } from "@stellar/stellar-sdk";

import type { CreatePaymentIntentInput } from "./contract";

export function toPaymentAmount(amount: string) {
  return BigInt(Math.round(Number(amount) * 10_000_000));
}

export function buildCreatePaymentIntentArgs(creatorAddress: string, payload: CreatePaymentIntentInput) {
  return [
    new Address(creatorAddress).toScVal(),
    new Address(payload.recipient).toScVal(),
    nativeToScVal(toPaymentAmount(payload.amount), { type: "i128" }),
  ];
}

export function buildGetPaymentIntentArgs(id: string) {
  return [nativeToScVal(BigInt(id), { type: "u64" })];
}
