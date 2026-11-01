// PER-45 (#62): lesson flashcards work like Review. A card starts with only
// "Show answer"; the ratings appear once it shows its English, and every
// rating flips the card back with a blank back.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

const backText = page => page.evaluate(() =>
  [...document.querySelectorAll('div')].filter(d => d.style.transform === 'rotateY(180deg)' && d.style.position === 'absolute').pop()?.textContent.trim() ?? null);
// The card's turn: 180deg while it shows English
const turned = page => page.evaluate(() =>
  [...document.querySelectorAll('div')].some(d => d.style.transformStyle === 'preserve-3d' && d.style.transform === 'rotateY(180deg)'));

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Greetings/ }).click();
  await page.getByRole('button', { name: /^Flashcards/ }).click();
});

test('the Persian side offers only "Show answer"', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Show answer' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'I know this' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Still learning' })).toHaveCount(0);
});

test('"Show answer" and tapping the card both flip to English and bring up the ratings', async ({ page }) => {
  await page.getByRole('button', { name: 'Show answer' }).click();
  await expect.poll(() => turned(page)).toBe(true);
  await expect(page.getByRole('button', { name: 'I know this' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Still learning' })).toBeVisible();

  await page.getByRole('button', { name: 'I know this' }).click();
  await page.getByText('Tap to reveal').click();
  await expect.poll(() => turned(page)).toBe(true);
  await expect(page.getByRole('button', { name: 'Still learning' })).toBeVisible();
});

test('every rating flips the card back to Persian with a blank back', async ({ page }) => {
  for (const rate of ['I know this', 'Still learning', 'Still learning', 'I know this']) {
    await page.getByRole('button', { name: 'Show answer' }).click();
    await expect.poll(() => backText(page)).toMatch(/^English/);
    await page.getByRole('button', { name: rate }).click();
    await page.evaluate(() => new Promise(requestAnimationFrame));
    expect(await turned(page), 'card turns back to Persian').toBe(false);
    expect(await backText(page), 'back is blank as it turns').toBe('');
    await expect(page.getByRole('button', { name: 'Show answer' })).toBeVisible();
  }
});
