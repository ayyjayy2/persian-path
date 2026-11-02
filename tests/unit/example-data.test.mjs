// Every flashcard's example sentence has a translation and parts that rebuild it exactly (#54)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../../learn-data.js';
import { EXAMPLES } from '../../example-data.js';

const words = LESSONS.flatMap(l => l.words);
const norm = s => s.trim().replace(/\s+/g, ' ');

test('every word has an entry, and no entry is left over', () => {
  const keys = new Set(words.map(w => w.key));
  assert.deepEqual(words.filter(w => !EXAMPLES[w.key]).map(w => w.key), [], 'words with no entry');
  assert.deepEqual(Object.keys(EXAMPLES).filter(k => !keys.has(k)), [], 'entries with no word');
});

test('the parts, joined, are exactly the example sentence', () => {
  for (const w of words) {
    const e = EXAMPLES[w.key];
    if (e) assert.equal(norm(e.parts.map(p => p[0]).join(' ')), norm(w.example), w.key);
  }
});

test('each entry has a translation, glossed parts, and a valid highlighted part', () => {
  for (const [k, e] of Object.entries(EXAMPLES)) {
    assert.ok(typeof e.en === 'string' && e.en.trim(), `${k}: translation`);
    assert.ok(Array.isArray(e.parts) && e.parts.length >= 1, `${k}: parts`);
    for (const p of e.parts) assert.ok(p.length >= 2 && p[0].trim() && p[1].trim(), `${k}: part ${JSON.stringify(p)}`);
    assert.ok(Number.isInteger(e.hit) && e.hit >= 0 && e.hit < e.parts.length, `${k}: hit`);
  }
});

test('each part has its pronunciation in Latin letters, and the sentence starts with a capital', () => {
  for (const [k, e] of Object.entries(EXAMPLES)) {
    for (const p of e.parts) assert.ok(typeof p[2] === 'string' && p[2].trim(), `${k}: pronunciation of ${p[0]}`);
    assert.match(e.parts[0][2], /^[^a-z]*[A-Z]/, `${k}: starts with a capital`);
  }
});

// Learner review (2026-10-31): the English and pronunciation lines must say what the Persian says
const line = e => e.parts.map(p => p[2]).join(' ');

test('the English sentence says what the Persian says, with no added notes', () => {
  for (const [k, e] of Object.entries(EXAMPLES)) {
    assert.doesNotMatch(e.en, /\((lit\.|or:)/, `${k}: ${e.en}`);
    assert.match(e.en, /^[^a-z]*[A-Z]/, `${k}: starts with a capital`);
  }
});

test('pronunciations join the ezāfe without hyphens', () => {
  for (const [k, e] of Object.entries(EXAMPLES)) assert.doesNotMatch(line(e), /-/, `${k}: ${line(e)}`);
});

test('reviewed example: "seven" reads "Seven days a week." / "Haft ruze hafte."', () => {
  const e = EXAMPLES['numbers:Haft'];
  assert.equal(e.en, 'Seven days a week.');
  assert.equal(line(e), 'Haft ruze hafte.');
});

test('the bold word under a card is spelled the way the card spells it', () => {
  const norm = s => s.toLowerCase().replace(/[^a-z']/g, '');
  // Cards whose sentence uses another form of the word (a conjugated verb, "my child" for child…)
  const otherForm = new Set(['expressions:Faarsi boladi?', 'expressions:Kami Faarsi baladam', 'family:Bache', 'home-life:Gorbe',
    'verbs:Raftan', 'verbs:Aamadan', 'verbs:Khordan', 'verbs:Nushidan', 'verbs:Khaandan', 'verbs:Neveshtan', 'verbs:Didan',
    'verbs:Shenidan', 'verbs:Daanestan', 'verbs:Goftan', 'verbs:Khaabidan', 'verbs:Budan']);
  for (const w of words) {
    if (otherForm.has(w.key)) continue;
    const e = EXAMPLES[w.key];
    // A phrase card can run past the bold part ("Esmat chiye?"), so check from the bold part to the end
    const fromHit = e.parts.slice(e.hit).map(p => p[2]).join(' ');
    assert.ok(norm(fromHit).startsWith(norm(e.parts[e.hit][2])) && (norm(e.parts[e.hit][2]).includes(norm(w.phonetic)) || norm(fromHit).includes(norm(w.phonetic))), `${w.key}: card "${w.phonetic}", bold "${e.parts[e.hit][2]}"`);
  }
});
