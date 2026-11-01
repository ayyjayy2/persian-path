// PER-47 (#54): a flashcard's English side shows the example sentence in
// glossed parts (right to left, card's word highlighted) and its translation,
// and it fits on the card at phone width for every word.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

const back = page => page.evaluate(() => {
  const el = [...document.querySelectorAll('div')].filter(d => d.style.transform === 'rotateY(180deg)' && d.style.position === 'absolute').pop();
  const parts = el.querySelector('[data-ex-parts]');
  return {
    english: el.children[1]?.textContent.trim(),
    parts: parts ? [...parts.children].map(c => c.textContent.trim()) : null,
    hits: parts ? parts.querySelectorAll('[data-hit]').length : 0,
    dir: parts?.getAttribute('dir'),
    translation: parts?.nextElementSibling?.textContent.trim(),
    fits: el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1,
  };
});

test('the English side shows the sentence in glossed parts with a translation', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Greetings/ }).click();
  await page.getByRole('button', { name: /^Flashcards/ }).click();
  await page.getByRole('button', { name: 'Show answer' }).click();
  const b = await back(page);
  expect(b.parts?.length).toBeGreaterThan(0);
  expect(b.dir).toBe('rtl');
  expect(b.hits).toBe(1);
  expect(b.translation).toBeTruthy();
});

test('every word\'s English side fits on the card', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'the phone card is the narrowest');
  test.setTimeout(180_000);
  await page.route('**/app.js', async r => {
    const body = (await (await r.fetch()).text()).replace("this.start('review', null, this.shuffle(d).slice(0, 10))", "this.start('review', null, d)");
    await r.fulfill({ contentType: 'text/javascript', body });
  });
  // Layout is what's checked here, so skip the animations
  await page.addInitScript(() => addEventListener('DOMContentLoaded', () => document.head.append(Object.assign(document.createElement('style'), { textContent: '*{transition:none!important;animation:none!important}' }))));
  await openApp(page);
  // Every lesson's flashcards done, so every word is due; Review then shows all of them, not 10
  const total = await page.evaluate(async () => {
    const { LESSONS } = await import('/learn-data.js');
    localStorage.setItem('pl_state_v2', JSON.stringify({ progress: Object.fromEntries(LESSONS.map(l => [l.id, { flashcard: true }])) }));
    return LESSONS.flatMap(l => l.words).length;
  });
  await page.reload();
  await page.getByRole('button', { name: 'Begin review' }).click();
  const overflow = []; let seen = 0;
  while (await page.getByRole('button', { name: 'Show answer' }).count()) {
    await page.getByRole('button', { name: 'Show answer' }).click();
    const b = await back(page);
    seen++; if (!b.fits) overflow.push(b.english);
    await page.getByRole('button', { name: 'Good' }).click();
  }
  expect(seen, 'every word was checked').toBe(total);
  expect(overflow).toEqual([]);
});
