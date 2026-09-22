import { defineConfig } from "vitest/config";

export default defineConfig({
  // Isolate from the SPA vite.config.ts at the repo root.
  root: ".",
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
