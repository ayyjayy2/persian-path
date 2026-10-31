// UI and regression tests in a real browser. Run: npm run test:ui
// Against a deployed copy instead of a local server: BASE_URL=<preview link> npm run test:ui
import { defineConfig, devices } from '@playwright/test';

const remote = process.env.BASE_URL;

export default defineConfig({
  testDir: 'tests',
  testMatch: ['ui/**/*.spec.mjs', 'regression/**/*.spec.mjs'],
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: remote || 'http://localhost:4173',
    // The app plays word audio; keep test runs silent
    launchOptions: { args: ['--mute-audio'] },
    trace: 'retain-on-failure',
  },
  // A phone and a desktop, since the layout changes at 600px
  projects: [
    { name: 'phone', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: remote ? undefined : {
    command: 'python3 -m http.server 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    stderr: 'ignore',
  },
});
