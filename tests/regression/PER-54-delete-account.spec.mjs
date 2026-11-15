// PER-54 (#77): a signed-in learner can delete their account from Profile. A password confirms it;
// afterwards the device is a fresh guest and nothing is uploaded again.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

// Stands in for backend.js: starts signed in, and records calls on window.__backend
const STUB = `
const USER = { id: 'u1', email: 'learner@example.com' };
const B = window.__backend = { calls: [], user: USER, password: 'right-pass' };
let listener = null;
const log = (name, ...args) => B.calls.push([name, ...args]);
export const lastUser = () => B.user;
export const onUser = cb => { listener = cb; setTimeout(() => cb(B.user), 0); return () => {}; };
export const signIn = async () => {};
export const signUp = async () => {};
export const signOutUser = async () => { B.user = null; listener && listener(null); };
export const loadDoc = async id => { log('loadDoc', id); return { xp: 250, completed_lessons: { greetings: { flashcard: 1 } } }; };
export const saveDoc = async id => { log('saveDoc', id); };
export async function deleteAccount(password) {
  log('deleteAccount', password);
  if (password !== B.password) { const e = new Error('wrong'); e.code = 'auth/invalid-credential'; throw e; }
  B.user = null; listener && listener(null);
}
`;

async function openProfile(page, state = { xp: 250 }) {
  await page.route('**/backend.js', r => r.fulfill({ contentType: 'text/javascript', body: STUB }));
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pl_state_v2', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, state);
  await openApp(page);
  await page.getByRole('button', { name: /^Profile/ }).first().click();
}
const calls = (page, name) => page.evaluate(n => window.__backend.calls.filter(c => c[0] === n), name);

test('a guest sees no Delete account link', async ({ page }) => {
  await page.route('**/backend.js', r => r.fulfill({ contentType: 'text/javascript', body: STUB.replace("user: USER", "user: null") }));
  await openApp(page);
  await page.getByRole('button', { name: /^Profile/ }).first().click();
  await expect(page.getByRole('button', { name: 'Sign in' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete account' })).toHaveCount(0);
});

test('a wrong password deletes nothing and keeps you signed in', async ({ page }) => {
  await openProfile(page);
  await page.getByRole('button', { name: 'Delete account' }).click();
  await expect(page.getByRole('heading', { name: 'Delete your account?' })).toBeVisible();
  await page.getByLabel('Enter your password to confirm').fill('nope');
  await page.locator('[data-delete-confirm]').click();
  await expect(page.getByText("That password isn't right.")).toBeVisible();
  await expect(page.getByText('learner@example.com').first()).toBeVisible();
});

test('the right password deletes the account, clears this device, and uploads nothing after', async ({ page }) => {
  await openProfile(page);
  await expect(page.getByText('250').first()).toBeVisible();
  await page.getByRole('button', { name: 'Delete account' }).click();
  await page.getByLabel('Enter your password to confirm').fill('right-pass');
  await page.locator('[data-delete-confirm]').click();
  await expect(page.getByText('Your account has been deleted.')).toBeVisible();
  expect(await calls(page, 'deleteAccount')).toEqual([['deleteAccount', 'right-pass']]);
  // A fresh guest: the sign-in prompt is back and the XP is gone
  await expect(page.getByRole('button', { name: 'Sign in' }).first()).toBeVisible();
  await expect(page.getByText('250')).toHaveCount(0);
  await page.waitForTimeout(1500);
  // Nothing is uploaded once the delete has started
  const log = await page.evaluate(() => window.__backend.calls.map(c => c[0]));
  expect(log.slice(log.indexOf('deleteAccount'))).not.toContain('saveDoc');
});

test('offline, the delete button is disabled', async ({ page, context }) => {
  await openProfile(page);
  await page.getByRole('button', { name: 'Delete account' }).click();
  await page.getByLabel('Enter your password to confirm').fill('right-pass');
  await expect(page.locator('[data-delete-confirm]')).toBeEnabled();
  await context.setOffline(true);
  await expect(page.getByText('Connect to the internet to delete your account.')).toBeVisible();
  await expect(page.locator('[data-delete-confirm]')).toBeDisabled();
});
