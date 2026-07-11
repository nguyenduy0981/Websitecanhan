import { defineConfig } from "vitest/config";
import path from "node:path";

// Separate from vitest.config.ts (unit tests, mocked Prisma) because these
// tests need a real Postgres and should never accidentally run as part of
// the fast `npm run test` inner loop. See tests/integration/setup.ts.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["./tests/integration/setup.ts"],
    // Real DB transactions/concurrency races take a bit longer than mocked
    // unit tests; keep parallelism off so tests sharing tables via
    // resetDatabase() don't stomp on each other.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
