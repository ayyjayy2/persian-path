// PER-49 (#56): numbers come in counting order (1 … 10, 20, 100) until every
// one is known (box 2+), then they're mixed, and they stay mixed.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

const KEYS = ['Yek', 'Do', 'Se', 'Chahaar', 'Panj', 'Shesh', 'Haft', 'Hasht', 'Noh', 'Dah', 'Bist', 'Sad'].map(p => 'numbers:' + p);
const IN_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 100];

// Opens the app with this saved state, then goes through a deck, reading each card's number
async function deck(page, state, open) {
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pl_state_v2', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, state);
  await openApp(page);
  await open();
  const seen = [];
  while (await page.getByRole('button', { name: 'Show answer' }).count()) {
    const n = await page.locator('[data-card-num]').first().textContent();
    seen.push(Number(n.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))));
    await page.getByRole('button', { name: 'Show answer' }).click();
    await page.getByRole('button', { name: /^(I know this|Good)/ }).click();
  }
  return seen;
}
const numbersLesson = page => async () => {
  await page.getByRole('button', { name: /Numbers/ }).first().click();
  await page.getByRole('button', { name: /^Flashcards/ }).click();
};
const srsAll = (b, t = Date.now() + 864e5) => Object.fromEntries(KEYS.map(k => [k, { b, t, u: 1 }]));

test('a new learner gets all twelve numbers in counting order', async ({ page }) => {
  expect(await deck(page, {}, numbersLesson(page))).toEqual(IN_ORDER);
});

test('once every number is in box 2 or higher, they are mixed', async ({ page }) => {
  const seen = await deck(page, { srs: srsAll(2) }, numbersLesson(page));
  expect(seen).toHaveLength(10);
  expect(seen).not.toEqual([...seen].sort((a, b) => a - b));
});

test('once mixed, numbers stay mixed even if one drops back', async ({ page }) => {
  const seen = await deck(page, { numbersMixed: true, srs: { ...srsAll(2), 'numbers:Se': { b: 0, t: 0, u: 1 } } }, numbersLesson(page));
  expect(seen).toHaveLength(10);
  expect(seen).not.toEqual([...seen].sort((a, b) => a - b));
});

test('Review keeps number cards in counting order until they are known', async ({ page }) => {
  const seen = await deck(page, { progress: { numbers: { flashcard: true } }, srs: srsAll(1, 0) }, async () => {
    await page.getByRole('button', { name: 'Begin review' }).click();
  });
  expect(seen).toHaveLength(10);
  expect(seen).toEqual([...seen].sort((a, b) => a - b));
});
