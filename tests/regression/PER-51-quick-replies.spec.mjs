// PER-51 (#57): everyday call-and-response pairs. Each reply follows its call on
// flashcards and says what it answers, and a Quick replies drill marks the lesson done.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

// "speaker|call" -> the right reply's Latin, for every round of a lesson's drill.
// Built in the page, where pairs-data.js is served as an ES module.
const answers = (page, lessonId) => page.evaluate(async id => {
  const t = (await import('/pairs-data.js')).buildRepliesDrill(id, a => a).turns, out = {};
  for (let i = 0; i < t.length; i += 2) out[`${t[i].speaker}|${t[i].lat}`] = t[i + 1].choices.find(c => c.ok).lat;
  return out;
}, lessonId);

test('the Expressions Quick replies drill tips a wrong answer and marks the activity done', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Expressions/ }).first().click();
  await page.getByRole('button', { name: /^Quick replies/ }).click();
  const key = await answers(page, 'expressions');
  let first = true;
  while (await page.locator('[data-choices]').count()) {
    const npc = page.locator('[data-who="npc"]').last();
    const right = key[`${await npc.getAttribute('data-speaker')}|${await npc.getAttribute('data-lat')}`];
    expect(right).toBeTruthy();
    // Match the Latin exactly: Salaamat baashi and Salaamat baashid are different answers
    if (first) {
      // Pick a wrong reply once and see the tip
      await page.locator(`[data-choices] button:not([data-lat="${right}"])`).first().click();
      await expect(page.getByText('Not quite.')).toBeVisible();
      first = false;
    }
    await page.locator(`[data-choices] button[data-lat="${right}"]`).click();
    await page.waitForTimeout(800); // the next call arrives after 700 ms
  }
  await page.getByRole('button', { name: 'Finish conversation' }).click();
  await expect(page.getByText('Quick replies complete')).toBeVisible();
  await page.getByRole('button', { name: 'Back to chapter' }).click();
  await expect(page.locator('[data-activity="replies"][data-done="true"]')).toBeVisible();
});

test('in Greetings flashcards, every reply comes right after its call and says what it answers', async ({ page }) => {
  // A fixed Math.random, so the deck is the same every run
  await page.addInitScript(() => { let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  await openApp(page);
  await page.getByRole('button', { name: /Greetings/ }).first().click();
  await page.getByRole('button', { name: /^Flashcards/ }).click();
  const seen = [];
  while (await page.getByRole('button', { name: 'Show answer' }).count()) {
    const lat = await page.locator('[data-card-lat]').textContent();
    await page.getByRole('button', { name: 'Show answer' }).click();
    const reply = await page.locator('[data-reply-to]').count() ? await page.locator('[data-reply-to]').textContent() : null;
    seen.push({ lat: lat.trim(), reply });
    await page.getByRole('button', { name: 'I know this' }).click();
  }
  const replies = seen.map((s, i) => [s, i]).filter(([s]) => s.reply);
  expect(replies.length).toBeGreaterThan(0);
  // "Reply to Khoshbakhtam" follows the Khoshbakhtam card
  for (const [s, i] of replies) expect(s.reply).toContain(seen[i - 1].lat);
});

test('lessons without pairs have no Quick replies activity', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Numbers/ }).first().click();
  await expect(page.getByRole('button', { name: /^Flashcards/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Quick replies/ })).toHaveCount(0);
});
