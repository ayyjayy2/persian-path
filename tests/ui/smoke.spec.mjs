// The app loads, shows its lessons, and runs without errors. Runs on every PR,
// locally and against the fixed preview link after each deploy.
import { test, expect } from '@playwright/test';
import { openApp, localVersion } from './helpers.mjs';

test('home shows the lesson path with no errors', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.getByRole('button', { name: /Greetings/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Learn$/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('serves the build from this checkout', async ({ page }) => {
  await openApp(page);
  const served = await page.evaluate(async () => (await (await fetch('/precache-manifest.js', { cache: 'no-store' })).text()).match(/PRECACHE_VERSION = "(\w+)"/)[1]);
  expect(served).toBe(localVersion());
});

test('the service worker installs so the app works offline', async ({ page }) => {
  await openApp(page);
  const ready = await page.evaluate(() => navigator.serviceWorker.ready.then(r => !!r.active));
  expect(ready).toBe(true);
});

test('repo-only files are not published', async ({ request, baseURL }) => {
  test.skip(baseURL.startsWith('http://localhost'), 'the local server serves every file; only Firebase applies the ignore list');
  for (const path of ['/package.json', '/README.md', '/scripts/build-precache.js', '/tests/ui/smoke.spec.mjs', '/playwright.config.mjs'])
    expect((await request.get(path)).status(), path).toBe(404);
});
