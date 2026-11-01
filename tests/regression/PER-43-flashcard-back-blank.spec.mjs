// PER-43 (#53): after you rate a flashcard, it turns back to Persian without
// flashing the next card's English. The back stays blank until you flip the card.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

// The card's back face (English side)
const backText = page => page.evaluate(() =>
  [...document.querySelectorAll('div')].filter(d => d.style.transform === 'rotateY(180deg)' && d.style.position === 'absolute').pop()?.textContent.trim() ?? null);

test('rating a flashcard never shows the next card\'s English while it turns back', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Greetings/ }).click();
  await page.getByRole('button', { name: /^Flashcards/ }).click();

  for (const rate of ['I know this', 'Still learning', 'I know this', 'Still learning']) {
    expect(await backText(page), 'back is blank before flipping').toBe('');

    await page.getByText('Tap to reveal').click();
    await expect.poll(() => backText(page)).toMatch(/^English/);

    await page.getByRole('button', { name: rate }).click();
    // Sample through the 0.5s turn: after the first frame the back must stay blank
    await page.evaluate(() => new Promise(requestAnimationFrame));
    const during = [];
    for (let i = 0; i < 8; i++) { during.push(await backText(page)); await page.waitForTimeout(60); }
    expect(during.every(t => t === ''), `back during the turn: ${JSON.stringify(during)}`).toBe(true);
  }
});
