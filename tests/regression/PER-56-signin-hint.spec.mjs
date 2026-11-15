// PER-56 (#82): a signed-out learner with no progress on this device sees "Have an account? Sign in
// to get your progress back." on Learn. A fresh iPhone home-screen install starts like that.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

const HINT = 'Have an account? Sign in to get your progress back.';
const seed = (page, state) => page.addInitScript(s => {
  if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pl_state_v2', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
}, state);

test('a signed-out learner with no progress sees the hint, and it opens sign-in', async ({ page }) => {
  await openApp(page);
  await expect(page.getByText(HINT)).toBeVisible();
  await page.locator('[data-signin-hint] button', { hasText: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

test('no hint once this device has progress', async ({ page }) => {
  await seed(page, { xp: 30, progress: { greetings: { flashcard: 1 } } });
  await openApp(page);
  await expect(page.getByRole('heading').first()).toBeVisible();
  await expect(page.getByText(HINT)).toHaveCount(0);
});

test('closing the hint keeps it closed after a reload', async ({ page }) => {
  await openApp(page);
  await page.locator('[data-signin-hint] button[aria-label="Close"]').click();
  await expect(page.getByText(HINT)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading').first()).toBeVisible();
  await expect(page.getByText(HINT)).toHaveCount(0);
});
