// PER-44 (PR #61): every PR previews at one fixed link, https://persian-learnin--next-vpksurng.web.app
// Locks in the workflow settings that keep that link from changing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const wf = name => fs.readFileSync(new URL(`../../.github/workflows/${name}`, import.meta.url), 'utf8');

test('PR previews deploy to the shared "next" channel', () => {
  assert.match(wf('firebase-hosting-pull-request.yml'), /^\s*channelId:\s*next\s*$/m);
});

test('each preview deploy keeps the channel alive for 30 days', () => {
  assert.match(wf('firebase-hosting-pull-request.yml'), /^\s*expires:\s*30d\s*$/m);
});

test('preview deploys queue instead of racing or cancelling each other', () => {
  const y = wf('firebase-hosting-pull-request.yml');
  assert.match(y, /^concurrency:\s*\n\s+group:\s*preview-next\s*\n\s+cancel-in-progress:\s*false/m);
});

test('only main deploys the live site', () => {
  const y = wf('firebase-hosting-merge.yml');
  assert.match(y, /branches:\s*\[main\]/);
  assert.match(y, /channelId:\s*live/);
});
