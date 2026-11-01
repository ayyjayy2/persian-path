// Shared setup for browser tests
import fs from 'node:fs';

// The PRECACHE_VERSION this checkout builds to (run `node scripts/build-precache.js` first)
export const localVersion = () =>
  fs.readFileSync(new URL('../../precache-manifest.js', import.meta.url), 'utf8').match(/PRECACHE_VERSION = "(\w+)"/)[1];

// Opens the app with audio silenced and console errors collected
export async function openApp(page, path = '/') {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
    if (window.speechSynthesis) window.speechSynthesis.speak = () => {};
  });
  await page.goto(path);
  return errors;
}
