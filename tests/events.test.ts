import { describe, expect, it } from "vitest";
import { getEscrowVaultConfig, getPaymentIntentConfig } from "../src/lib/stellar/contract";

describe("Contract Configuration & Event Structure", () => {
  it("reads payment intent contract config correctly", () => {
    const config = getPaymentIntentConfig();
    expect(config).toHaveProperty("contractId");
    expect(config).toHaveProperty("rpcUrl");
    expect(typeof config.ready).toBe("boolean");
  });

  it("reads escrow vault contract config correctly", () => {
    const config = getEscrowVaultConfig();
    expect(config).toHaveProperty("contractId");
    expect(config).toHaveProperty("rpcUrl");
    expect(typeof config.ready).toBe("boolean");
  });
});
