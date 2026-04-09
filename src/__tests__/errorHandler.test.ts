import { describe, it, expect } from "vitest";

describe("errorHandler", () => {
  it("returns standardized error response", async () => {
    const { errorHandler } = await import("../middlewares/errorHandler");

    let capturedStatus: number | undefined;
    let capturedBody: unknown;

    const mockRes = {
      status(code: number) { capturedStatus = code; return this; },
      json(body: unknown) { capturedBody = body; return this; },
    } as any;

    const err = new Error("Something broke");
    errorHandler(err, {} as any, mockRes, (() => {}) as any);

    expect(capturedStatus).toBe(500);
    expect(capturedBody).toEqual({
      success: false,
      message: "Something broke",
    });
  });

  it("uses err.status when available", async () => {
    const { errorHandler } = await import("../middlewares/errorHandler");

    let capturedStatus: number | undefined;
    let capturedBody: unknown;

    const mockRes = {
      status(code: number) { capturedStatus = code; return this; },
      json(body: unknown) { capturedBody = body; return this; },
    } as any;

    const err: any = new Error("Not Found");
    err.status = 404;
    errorHandler(err, {} as any, mockRes, (() => {}) as any);

    expect(capturedStatus).toBe(404);
    expect(capturedBody).toEqual({
      success: false,
      message: "Not Found",
    });
  });
});
