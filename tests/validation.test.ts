import { describe, expect, it } from "vitest";
import { isValidAmount, isValidPublicKey } from "../src/lib/stellar/validation";

describe("Stellar validation", () => {
  it("accepts a valid Stellar public key", () => {
    const validAddress =
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

    expect(isValidPublicKey(validAddress)).toBe(true);
  });

  it("rejects an invalid Stellar public key", () => {
    expect(isValidPublicKey("invalid-address")).toBe(false);
  });

  it("accepts a positive amount", () => {
    expect(isValidAmount("10.5")).toBe(true);
  });

  it("rejects zero and negative amounts", () => {
    expect(isValidAmount("0")).toBe(false);
    expect(isValidAmount("-5")).toBe(false);
  });

  it("rejects an empty amount", () => {
    expect(isValidAmount("")).toBe(false);
  });
});
