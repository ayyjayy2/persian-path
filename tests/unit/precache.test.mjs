// The app loads offline only if every module it imports is precached
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../../', import.meta.url);
const read = f => fs.readFileSync(new URL(f, root), 'utf8');

test('every module the app imports is in the precache list', () => {
  const manifest = read('precache-manifest.js');
  const files = new Set(JSON.parse(manifest.match(/PRECACHE_FILES = (\[.*?\]);/s)[1]));
  const seen = new Set(), todo = ['app.js'];
  while (todo.length) {
    const f = todo.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    for (const [, spec] of read(f).matchAll(/^\s*import\s[^'"]*['"](\.[^'"]+)['"]/gm))
      todo.push(new URL(spec, new URL(f, root)).pathname.slice(root.pathname.length));
  }
  assert.deepEqual([...seen].filter(f => !files.has('/' + f)), []);
});
