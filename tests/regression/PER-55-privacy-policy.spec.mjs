// PER-55 (#78): a privacy policy page at /privacy.html, linked from Profile and the sign-up sheet,
// that opens as itself (not the app) even offline once the service worker is installed.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

const isPolicy = async page => {
  await expect(page.getByRole('heading', { name: 'Privacy policy', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /github\.com\/ayyjayy2\/persian-path/ })).toBeVisible();
};

test('the page shows the policy and links back to the app', async ({ page }) => {
  await page.goto('/privacy.html');
  await isPolicy(page);
  await expect(page.getByText('No ads, analytics or tracking', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: /Back to Persian Learnin/ }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('Profile links to the policy', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /^Profile/ }).first().click();
  await page.getByRole('link', { name: 'Privacy policy' }).click();
  await isPolicy(page);
});

test('the sign-up sheet links to the policy', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /^Profile/ }).first().click();
  await page.getByRole('button', { name: 'Sign in' }).first().click();
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByText('By creating an account you agree to the')).toBeVisible();
  await page.getByRole('link', { name: 'privacy policy', exact: true }).click();
  await isPolicy(page);
});

test('offline, with the service worker installed, the policy still opens as itself', async ({ page, context }) => {
  await openApp(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto('/privacy.html');
  await isPolicy(page);
});
