import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:8081",
    viewport: { width: 402, height: 874 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["json", { outputFile: "qa/test-results.json" }]],
  webServer: {
    command: "npx expo start --web --port 8081 --offline",
    url: "http://localhost:8081",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
