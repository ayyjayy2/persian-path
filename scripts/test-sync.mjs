// Tests for sync.js. Run: node scripts/test-sync.mjs
import assert from 'node:assert/strict';
import { mergeState } from '../sync.js';

const t = (name, fn) => { try { fn(); console.log('ok  ', name); } catch (e) { console.log('FAIL', name); console.log(e.message); process.exitCode = 1; } };

t('srs: newer entry wins per key, tie keeps local', () => {
  const m = mergeState(
    { srs: { a: { b: 1, t: 5, u: 10 }, b: { b: 2, t: 5, u: 30 }, c: { b: 3, t: 5, u: 7 } } },
    { srs: { a: { b: 4, t: 9, u: 20 }, b: { b: 0, t: 1, u: 25 }, c: { b: 0, t: 1, u: 7 }, d: { b: 1, t: 1, u: 1 } } });
  assert.deepEqual(m.srs, { a: { b: 4, t: 9, u: 20 }, b: { b: 2, t: 5, u: 30 }, c: { b: 3, t: 5, u: 7 }, d: { b: 1, t: 1, u: 1 } });
});

t('srs: legacy entries without u lose to stamped ones', () => {
  const m = mergeState({ srs: { a: { b: 1, t: 5 } } }, { srs: { a: { b: 3, t: 8, u: 1 } } });
  assert.deepEqual(m.srs.a, { b: 3, t: 8, u: 1 });
});

t('myWords: newer edit wins, newest created first', () => {
  const m = mergeState(
    { myWords: [{ id: 'x', en: 'old', created: 1, u: 1 }, { id: 'y', en: 'mine', created: 3, u: 3 }] },
    { myWords: [{ id: 'x', en: 'new', created: 1, u: 2 }, { id: 'z', en: 'theirs', created: 2, u: 2 }] });
  assert.deepEqual(m.myWords.map(w => w.id + ':' + w.en), ['y:mine', 'z:theirs', 'x:new']);
});

t('myWords: a delete beats an older edit and cleans srs and mistakes', () => {
  const m = mergeState(
    { myWords: [{ id: 'x', en: 'cat', created: 1, u: 5 }], srs: { 'my:x': { b: 1, t: 1, u: 5 } }, mistakes: ['my:x', 'food:Aab'], mistakeAt: { 'my:x': 5, 'food:Aab': 4 } },
    { deletedWords: { x: 9 } });
  assert.deepEqual(m.myWords, []);
  assert.deepEqual(m.deletedWords, { x: 9 });
  assert.equal(m.srs['my:x'], undefined);
  assert.deepEqual(m.mistakes, ['food:Aab']);
  assert.deepEqual(m.mistakeAt, { 'food:Aab': 4 });
});

t('myWords: an edit after a delete brings the word back', () => {
  const m = mergeState({ deletedWords: { x: 5 } }, { myWords: [{ id: 'x', en: 'cat', created: 1, u: 8 }] });
  assert.deepEqual(m.myWords.map(w => w.id), ['x']);
});

t('deletedWords: union, later time per id', () => {
  const m = mergeState({ deletedWords: { a: 1, b: 9 } }, { deletedWords: { a: 4, c: 2 } });
  assert.deepEqual(m.deletedWords, { a: 4, b: 9, c: 2 });
});

t('mistakes: union sorted newest first, capped at 40', () => {
  const loc = Array.from({ length: 30 }, (_, i) => 'l' + i), rem = Array.from({ length: 30 }, (_, i) => 'r' + i);
  const at = {}; loc.forEach((k, i) => { at[k] = 100 - i * 2; }); const atR = {}; rem.forEach((k, i) => { atR[k] = 99 - i * 2; });
  const m = mergeState({ mistakes: loc, mistakeAt: at }, { mistakes: rem, mistakeAt: atR });
  assert.equal(m.mistakes.length, 40);
  assert.deepEqual(m.mistakes.slice(0, 4), ['l0', 'r0', 'l1', 'r1']);
  assert.equal(Object.keys(m.mistakeAt).length, 40);
});

t('mistakes: same key keeps the later time and appears once', () => {
  const m = mergeState({ mistakes: ['a'], mistakeAt: { a: 1 } }, { mistakes: ['a'], mistakeAt: { a: 5 } });
  assert.deepEqual(m.mistakes, ['a']);
  assert.deepEqual(m.mistakeAt, { a: 5 });
});

t('prefs: the later prefsU wins whole, tie keeps local', () => {
  assert.deepEqual(mergeState({ prefs: { register: 'spoken' }, prefsU: 1 }, { prefs: { register: 'written', speed: 0.8 }, prefsU: 2 }).prefs, { register: 'written', speed: 0.8 });
  const tie = mergeState({ prefs: { register: 'spoken' }, prefsU: 2 }, { prefs: { register: 'written' }, prefsU: 2 });
  assert.deepEqual(tie.prefs, { register: 'spoken' });
  assert.equal(tie.prefsU, 2);
});

t('flags: seen anywhere means seen everywhere', () => {
  const m = mergeState({ scriptSeen: false, vowelsSeen: true, grammarSeen: { present: true } }, { scriptSeen: true, vowelsSeen: false, grammarSeen: { past: true } });
  assert.equal(m.scriptSeen, true);
  assert.equal(m.vowelsSeen, true);
  assert.deepEqual(m.grammarSeen, { present: true, past: true });
});

t('todayXp: same day keeps the higher', () => {
  const d = 'Fri Oct 23 2026';
  assert.equal(mergeState({ todayXp: 12, lastPlayedDate: d }, { todayXp: 30, lastPlayedDate: d }).todayXp, 30);
});

t('todayXp: different days take the newer day', () => {
  assert.equal(mergeState({ todayXp: 50, lastPlayedDate: 'Thu Oct 22 2026' }, { todayXp: 10, lastPlayedDate: 'Fri Oct 23 2026' }).todayXp, 10);
  assert.equal(mergeState({ todayXp: 50, lastPlayedDate: 'Fri Oct 23 2026' }, { todayXp: 10, lastPlayedDate: 'Thu Oct 22 2026' }).todayXp, 50);
});

t('empty remote returns local values with defaults filled', () => {
  const m = mergeState({ srs: { a: { b: 1, t: 1 } }, mistakes: [], prefs: {}, myWords: [] }, {});
  assert.deepEqual(m.srs, { a: { b: 1, t: 1 } });
  assert.deepEqual(m.deletedWords, {});
  assert.deepEqual(m.grammarSeen, {});
  assert.equal(m.prefsU, 0);
});

t('null remote is treated as empty', () => {
  assert.deepEqual(mergeState({ todayXp: 3 }, null).todayXp, 3);
});
