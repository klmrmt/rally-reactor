import { describe, it, expect } from "vitest";

describe("config", () => {
  it("loads with default values when env vars are missing", async () => {
    const { config } = await import("../config/config");

    expect(config.port).toBeDefined();
    expect(config.clientUrl).toBe("http://localhost:5173");
    expect(config.authRateLimiting.windowMs).toBe(15 * 60 * 1000);
    expect(config.authRateLimiting.maxRequests).toBe(10);
    expect(config.rallyRateLimiting.maxRequests).toBe(5);
    expect(config.rallyCreation.maxTries).toBe(5);
  });
});
