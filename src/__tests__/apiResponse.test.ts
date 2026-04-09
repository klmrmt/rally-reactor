import { describe, it, expect } from "vitest";

describe("apiResponse", () => {
  it("RequestResponse builds correct shape", async () => {
    const { RequestResponse } = await import("../utils/apiResponse");

    let capturedStatus: number | undefined;
    let capturedBody: unknown;

    const mockRes = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(body: unknown) {
        capturedBody = body;
        return this;
      },
    } as any;

    RequestResponse(mockRes, 200, true, "OK", { id: "123" });

    expect(capturedStatus).toBe(200);
    expect(capturedBody).toEqual({
      success: true,
      message: "OK",
      data: { id: "123" },
    });
  });

  it("omits data when not provided", async () => {
    const { RequestResponse } = await import("../utils/apiResponse");

    let capturedBody: unknown;
    const mockRes = {
      status() { return this; },
      json(body: unknown) { capturedBody = body; return this; },
    } as any;

    RequestResponse(mockRes, 400, false, "Bad request");

    expect(capturedBody).toEqual({
      success: false,
      message: "Bad request",
    });
  });
});
