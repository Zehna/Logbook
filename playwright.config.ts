import { defineConfig, devices } from "@playwright/test";

/**
 * Konfigurasi Playwright E2E untuk LogMagang OS
 * Dilengkapi WebServer otomatis Next.js dan toleransi timeout aplikasi AI.
 */
export default defineConfig({
  testDir: "./e2e/tests",
  timeout: 90 * 1000, // Timeout global 90 detik untuk mengakomodasi loading awal & inferensi AI
  expect: {
    timeout: 20 * 1000, // Timeout 20 detik untuk assertion respon AI LLM
  },
  fullyParallel: false, // Disetel sequential agar alur pengujian lintas-tab stabil
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15 * 1000,
    navigationTimeout: 60 * 1000,
  },

  /* Konfigurasi WebServer: Otomatis menyalakan Next.js dev server jika belum aktif */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 120 detik untuk proses cold-start & bundling kompilasi Next.js
    stdout: "pipe",
    stderr: "pipe",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
