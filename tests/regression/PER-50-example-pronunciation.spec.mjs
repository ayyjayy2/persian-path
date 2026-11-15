// PER-50 (#70): under the example's translation, the card shows how the Persian
// sentence is pronounced, with the card's word in bold.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

test('the English side shows the sentence pronunciation with the card\'s word in bold', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Greetings/ }).click();
  await page.getByRole('button', { name: /^Flashcards/ }).click();
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Show answer' }).click();
    const r = await page.evaluate(() => {
      const back = [...document.querySelectorAll('div')].filter(d => d.style.transform === 'rotateY(180deg)' && d.style.position === 'absolute').pop();
      const lat = back.querySelector('[data-ex-lat]');
      const translation = back.querySelector('[data-ex-parts]')?.nextElementSibling;
      return {
        afterTranslation: !!lat && translation?.nextElementSibling === lat,
        text: lat?.textContent.trim() ?? '',
        bold: [...(lat?.querySelectorAll('b') ?? [])].map(b => ({ text: b.textContent, weight: getComputedStyle(b).fontWeight })),
      };
    });
    expect(r.afterTranslation, 'pronunciation sits under the translation').toBe(true);
    expect(r.text).toMatch(/^[A-Z][A-Za-z'\-]/);
    expect(r.bold).toHaveLength(1);
    expect(Number(r.bold[0].weight)).toBeGreaterThanOrEqual(600);
    expect(r.text).toContain(r.bold[0].text);
    await page.getByRole('button', { name: 'I know this' }).click();
  }
});
