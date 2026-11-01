// PER-48 (#55): Words to revisit shows each word's pronunciation, and a number
// row labels its digit so it can't be mistaken for the number word.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

async function missEveryNumber(page) {
  await openApp(page);
  await page.getByRole('button', { name: /Numbers/ }).first().click();
  await page.getByRole('button', { name: /^Flashcards/ }).click();
  while (await page.getByRole('button', { name: 'Show answer' }).count()) {
    await page.getByRole('button', { name: 'Show answer' }).click();
    await page.getByRole('button', { name: 'Still learning' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Words to revisit' })).toBeVisible();
}

const rows = page => page.evaluate(() => {
  const h = [...document.querySelectorAll('h3')].find(e => e.textContent === 'Words to revisit');
  return [...h.parentElement.querySelectorAll('[data-revisit]')].map(r => ({
    text: r.textContent.trim(),
    lat: r.querySelector('[data-lat]')?.textContent.trim() || '',
    digit: r.querySelector('[data-digit]')?.textContent.trim() || null,
    fits: r.scrollWidth <= r.clientWidth + 1,
  }));
});

test('each word to revisit shows its pronunciation, and numbers label their digit', async ({ page }) => {
  await missEveryNumber(page);
  const r = await rows(page);
  expect(r.length).toBeGreaterThan(0);
  for (const row of r) {
    expect(row.lat, `pronunciation in "${row.text}"`).toMatch(/[A-Za-z]/);
    expect(row.digit, `digit label in "${row.text}"`).toMatch(/^[۰-۹]+\s*digit \d+$/);
    expect(row.fits, `"${row.text}" fits the row`).toBe(true);
  }
});

test('quiz questions label the digit without giving away the number', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Numbers/ }).first().click();
  await page.getByRole('button', { name: /^Recognition/ }).click();
  // Every Numbers word has a digit, so the first question shows at least one
  const labels = await page.locator('[data-digit]').allTextContents();
  expect(labels.length).toBeGreaterThan(0);
  for (const t of labels) expect(t, 'no Western digits in a quiz question').not.toMatch(/[0-9]/);
});
