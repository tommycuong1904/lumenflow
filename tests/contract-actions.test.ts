import { describe, expect, it } from "vitest";
import {
  buildCreateEscrowVaultArgs,
  buildRefundEscrowVaultArgs,
  buildReleaseEscrowVaultArgs,
  toPaymentAmount,
} from "../src/lib/stellar/contract-payload";

describe("Contract Payload Builders for Level 3 Escrow", () => {
  const payer = "GBBSRCJ7LU46KMCJKEZBX4ZKVHEQYWRBCJ7XTXJGJRWTXL226QGK5PME";
  const payee = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

  it("converts XLM amount to stroops integer correctly", () => {
    expect(toPaymentAmount("10.5")).toBe(BigInt(105000000));
    expect(toPaymentAmount("1")).toBe(BigInt(10000000));
    expect(toPaymentAmount("0.0000001")).toBe(BigInt(1));
  });

  it("builds create_escrow arguments with valid ScVals", () => {
    const args = buildCreateEscrowVaultArgs(payer, {
      payee,
      amount: "25",
      memo: "Milestone payment",
    });

    expect(args).toHaveLength(4);
  });

  it("builds release_escrow arguments with escrow ID and payer address", () => {
    const args = buildReleaseEscrowVaultArgs(1, payer);
    expect(args).toHaveLength(2);
  });

  it("builds refund_escrow arguments with escrow ID and payer address", () => {
    const args = buildRefundEscrowVaultArgs("2", payer);
    expect(args).toHaveLength(2);
  });
});
