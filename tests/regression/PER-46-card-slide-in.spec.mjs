// PER-46 (#64): rating a card slides the next one in while it flips back to
// Persian. Flipping alone doesn't slide, and "reduce motion" skips the slide.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

// The card's outer frame carries the slide; the inner one carries the flip
const frame = page => page.evaluate(() => {
  const inner = [...document.querySelectorAll('div')].find(d => d.style.transformStyle === 'preserve-3d');
  const cs = getComputedStyle(inner.parentElement);
  return { slide: cs.animationName, turned: inner.style.transform === 'rotateY(180deg)', back: inner.lastElementChild.textContent.trim() };
});

async function openFlashcards(page) {
  await openApp(page);
  await page.getByRole('button', { name: /Greetings/ }).click();
  await page.getByRole('button', { name: /^Flashcards/ }).click();
}

test('each new card slides in while it flips back, with a blank back', async ({ page }) => {
  await openFlashcards(page);
  let last = (await frame(page)).slide;
  for (const rate of ['I know this', 'Still learning', 'I know this']) {
    await page.getByRole('button', { name: 'Show answer' }).click();
    const flipped = await frame(page);
    expect(flipped.slide, 'flipping alone does not restart the slide').toBe(last);

    await page.getByRole('button', { name: rate }).click();
    await page.evaluate(() => new Promise(requestAnimationFrame));
    const next = await frame(page);
    expect(next.slide).toMatch(/^cardIn/);
    expect(next.slide, 'a new card restarts the slide').not.toBe(last);
    expect(next.turned, 'and flips back to Persian').toBe(false);
    expect(next.back, 'with a blank back').toBe('');
    last = next.slide;
  }
});

test('with reduce motion on, cards only flip', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openFlashcards(page);
  await page.getByRole('button', { name: 'Show answer' }).click();
  await page.getByRole('button', { name: 'I know this' }).click();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect((await frame(page)).slide).toBe('none');
});
