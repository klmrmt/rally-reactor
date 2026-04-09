import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    env: {
      PHONE_ENCRYPTION_KEY: "01234567890123456789012345678901",
      JWT_SECRET: "test-jwt-secret-for-vitest",
    },
  },
});
