import { describe, it, expect } from "vitest";

const { hashPhoneNumber, encryptPhoneNumber, decryptPhoneNumber } = await import("../utils/security");

describe("hashPhoneNumber", () => {
  it("returns a hex string", () => {
    const result = hashPhoneNumber("+15551234567");
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    const a = hashPhoneNumber("+15551234567");
    const b = hashPhoneNumber("+15551234567");
    expect(a).toBe(b);
  });

  it("produces different hashes for different inputs", () => {
    const a = hashPhoneNumber("+15551234567");
    const b = hashPhoneNumber("+15559876543");
    expect(a).not.toBe(b);
  });
});

describe("encryptPhoneNumber / decryptPhoneNumber", () => {
  it("round-trips a phone number", () => {
    const phone = "+15551234567";
    const encrypted = encryptPhoneNumber(phone);
    const decrypted = decryptPhoneNumber(encrypted);
    expect(decrypted).toBe(phone);
  });

  it("produces different ciphertext each call (random IV)", () => {
    const phone = "+15551234567";
    const a = encryptPhoneNumber(phone);
    const b = encryptPhoneNumber(phone);
    expect(a).not.toBe(b);
  });

  it("encrypted output contains iv:data format", () => {
    const encrypted = encryptPhoneNumber("+15551234567");
    expect(encrypted).toContain(":");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/^[0-9a-f]{32}$/);
  });
});
