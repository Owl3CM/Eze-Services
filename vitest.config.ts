import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["lib/__tests__/**/*.test.ts"],
  },
});
