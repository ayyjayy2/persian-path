// PER-53 (#8): the three flags in "The Iranian Flag" look the same: one size, filling their
// box edge to edge, with a thin outline and no cream frame.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';

test('the flags share one size, fill their box, and have no cream frame', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /^Explore/ }).first().click();
  await page.getByText('The Iranian Flag').first().click();
  const flags = page.locator('figure img');
  await expect(flags).toHaveCount(3);
  const boxes = await flags.evaluateAll(imgs => imgs.map(img => {
    const cs = getComputedStyle(img), r = img.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), border: cs.borderTopWidth, fit: cs.objectFit };
  }));
  for (const b of boxes) {
    expect(b).toMatchObject({ w: boxes[0].w, h: boxes[0].h, border: '0px', fit: 'cover' });
    expect(Math.abs(b.w / b.h - 7 / 4)).toBeLessThan(0.02);
  }
});
