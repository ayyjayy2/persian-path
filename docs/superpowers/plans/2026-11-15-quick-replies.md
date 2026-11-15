# Quick replies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach the everyday call-and-response pairs in Greetings and Expressions: each reply follows its call in flashcards and quizzes, and a new "Quick replies" drill has you answer each call (informal rounds, then polite ones).

**Architecture:** A new pure module `pairs-data.js` holds the pairs and builds the drill in the checkpoint scenario shape, so the existing `convo` exercise runs it. `learn-data.js` gains the new words and `activitiesFor(lessonId)`, so Quick replies only appears (and only counts) in the two lessons. `app.js`/`view.js` get small changes: start the drill, record it as the lesson's `replies` activity, show a per-turn speaker, keep pairs together in word pools, and label reply cards.

**Tech Stack:** Preact + htm (no build step), ES modules, Node test runner (`node --test`), Playwright 1.56.

**Spec:** `docs/superpowers/specs/2026-11-15-quick-replies-design.md`. Issue: #57 "Early lessons: teach the everyday call-and-response pairs (Che khabar? → Salaamati)". Branch: `PER-51-call-and-response` (off `release/lessons-everyday-basics`).

**Rules for this repo:**
- Never stage `Persian Learning App Revamp.zip` or `scripts/list-missing.js`.
- Run `node scripts/build-precache.js` before committing app files; a unit test fails if an imported module isn't precached.
- End every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Ask the user before every push.

---

## File structure

| File | Change | Responsibility |
|---|---|---|
| `pairs-data.js` | create | `PAIRS`, `pairsFor`, `buildRepliesDrill`, `pairUnits`, `pairedPool`, `replyTo`. Pure, no DOM. |
| `learn-data.js` | modify | 9 new lesson words; `replies` activity; `activitiesFor` |
| `example-data.js` | modify | Example sentence entries for the 9 new words |
| `app.js` | modify | Start the drill; record `replies`; per-turn speaker; paired pools; reply label; `activitiesFor` everywhere |
| `view.js` | modify | "Reply to …" line on the flashcard back; `data-*` hooks on conversation messages |
| `scripts/build-precache.js` | modify | Add `pairs-data.js` to `SHELL` |
| `tests/unit/pairs-data.test.mjs` | create | Unit tests for the pairs module and `activitiesFor` |
| `tests/regression/PER-51-quick-replies.spec.mjs` | create | Browser regression test |

---

### Task 1: Regression test (fails first)

**Files:**
- Create: `tests/regression/PER-51-quick-replies.spec.mjs`

- [ ] **Step 1: Write the failing test**

```js
// PER-51 (#57): everyday call-and-response pairs. Each reply follows its call on
// flashcards and says what it answers, and a Quick replies drill marks the lesson done.
import { test, expect } from '@playwright/test';
import { openApp } from '../ui/helpers.mjs';
import { buildRepliesDrill } from '../../pairs-data.js';

// "speaker|call" -> the right reply's Latin, for every round of a lesson's drill
function answers(lessonId) {
  const t = buildRepliesDrill(lessonId, a => a).turns, out = {};
  for (let i = 0; i < t.length; i += 2) out[`${t[i].speaker}|${t[i].lat}`] = t[i + 1].choices.find(c => c.ok).lat;
  return out;
}

test('the Expressions Quick replies drill tips a wrong answer and marks the activity done', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Expressions/ }).first().click();
  await page.getByRole('button', { name: /^Quick replies/ }).click();
  const key = answers('expressions');
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
```

Note on the second test: the deck is ten random words with pairs kept together, so `Math.random` is seeded. If that seed's deck happens to hold no pair, `replies.length` is 0 and the test fails: try seeds 1–20 and keep the first that draws at least one reply.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx playwright test tests/regression/PER-51-quick-replies.spec.mjs --project=desktop`
Expected: FAIL. The import of `../../pairs-data.js` fails ("Cannot find module").

- [ ] **Step 3: Commit**

```bash
git add tests/regression/PER-51-quick-replies.spec.mjs
git commit -m "Add a regression test for Quick replies and call-before-reply order (#57)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: New lesson words and their examples

**Files:**
- Modify: `learn-data.js` (the `greetings` and `expressions` entries of `RAW`, lines 4–30)
- Modify: `example-data.js`

- [ ] **Step 1: Run the example-data unit test to confirm it currently passes**

Run: `node --test tests/unit/example-data.test.mjs`
Expected: PASS.

- [ ] **Step 2: Add the Greetings words**

In `learn-data.js`, in the `greetings` word list:

After `["سلام","Salaam","Hello","سلام! چطوری؟"],` insert:
```js
    ["سلام علیکم","Salaam Aleykom","Peace be upon you (formal hello)","سلام علیکم، حالتون چطوره؟"],
    ["علیکم السلام","Aleykom Salaam","And upon you, peace (reply)","علیکم السلام، خوش اومدید."],
```
After `["خداحافظ","Khodaa Haafez",…],` insert:
```js
    ["به سلامت","Be Salaamat","Go safely (reply to goodbye)","خداحافظ! به سلامت."],
```
After `["خوشبختم","Khoshbakhtam",…],` insert:
```js
    ["همچنین","Hamchenin","Likewise","همچنین، خوشبختم."],
```
After `["ببخشید","Bebakhshid",…],` insert:
```js
    ["عیب نداره","Eyb Nadaare","No problem (lit: it has no fault)","عیب نداره، اتفاق میفته.","عیبی ندارد","Eybi Nadaarad"],
```

- [ ] **Step 3: Add the Expressions words**

In the `expressions` word list:

Before `["سلامتی","Salaamati",…],` insert:
```js
    ["چه خبر؟","Che Khabar?","What's new?","سلام! چه خبر؟"],
```
Before `["نوش جان","Nooshe Jaan",…],` insert:
```js
    ["دستت درد نکنه","Dastet Dard Nakone","Thank you (lit: may your hand not hurt)","غذا خیلی خوب بود، دستت درد نکنه.","دستت درد نکند","Dastat Dard Nakonad"],
```
After `["خسته نباشی","Khaste Nabashi",…],` insert:
```js
    ["سلامت باشی","Salaamat Baashi","May you be healthy (reply)","ممنون، سلامت باشی."],
    ["عافیت باشه","Aafiyat Baashe","Bless you (after a sneeze)","عافیت باشه! سرما خوردی؟","عافیت باشد","Aafiyat Baashad"],
```

- [ ] **Step 4: Run the example-data test to see it fail**

Run: `node --test tests/unit/example-data.test.mjs`
Expected: FAIL, "words with no entry" listing the 9 new keys.

- [ ] **Step 5: Add the example entries**

In `example-data.js`, add these inside `EXAMPLES`, next to each lesson's other entries:

```js
  "greetings:Salaam Aleykom": { en: "Peace be upon you, how are you?", parts: [["سلام علیکم،", "peace be upon you"], ["حالتون", "your health"], ["چطوره؟", "how is it?"]], hit: 0 },
  "greetings:Aleykom Salaam": { en: "And upon you, peace. Welcome.", parts: [["علیکم السلام،", "and upon you, peace"], ["خوش اومدید.", "welcome"]], hit: 0 },
  "greetings:Be Salaamat": { en: "Goodbye! Go safely.", parts: [["خداحافظ!", "goodbye!"], ["به سلامت.", "go safely"]], hit: 1 },
  "greetings:Hamchenin": { en: "Likewise, nice to meet you.", parts: [["همچنین،", "likewise"], ["خوشبختم.", "nice to meet you"]], hit: 0 },
  "greetings:Eyb Nadaare": { en: "No problem, it happens.", parts: [["عیب نداره،", "no problem"], ["اتفاق میفته.", "it happens"]], hit: 0 },
  "expressions:Che Khabar?": { en: "Hi! What's new?", parts: [["سلام!", "hi!"], ["چه خبر؟", "what's new?"]], hit: 1 },
  "expressions:Dastet Dard Nakone": { en: "The food was really good, thank you.", parts: [["غذا", "the food"], ["خیلی خوب بود،", "was very good"], ["دستت درد نکنه.", "thank you"]], hit: 2 },
  "expressions:Salaamat Baashi": { en: "Thanks, may you be healthy.", parts: [["ممنون،", "thanks"], ["سلامت باشی.", "may you be healthy"]], hit: 1 },
  "expressions:Aafiyat Baashe": { en: "Bless you! Did you catch a cold?", parts: [["عافیت باشه!", "bless you!"], ["سرما خوردی؟", "did you catch a cold?"]], hit: 0 },
```

- [ ] **Step 6: Run the unit tests**

Run: `npm run test:unit`
Expected: PASS (all files).

- [ ] **Step 7: Rebuild precache and commit**

```bash
node scripts/build-precache.js
git add learn-data.js example-data.js precache-manifest.js
git commit -m "Teach the replies and calls the pairs need in Greetings and Expressions (#57)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `pairs-data.js`: the pairs and the drill

**Files:**
- Create: `pairs-data.js`
- Create: `tests/unit/pairs-data.test.mjs`
- Modify: `scripts/build-precache.js:10` (SHELL)

- [ ] **Step 1: Write the failing unit test**

```js
// Everyday call-and-response pairs and the Quick replies drill (#57)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../../learn-data.js';
import { PAIRS, pairsFor, buildRepliesDrill } from '../../pairs-data.js';

const lesson = id => LESSONS.find(l => l.id === id);
const keep = a => a; // no shuffling, so results are predictable

test('every pair links to words its lesson teaches', () => {
  for (const p of PAIRS) {
    const ph = new Set(lesson(p.lesson).words.map(w => w.phonetic));
    assert.ok(ph.has(p.call.word), `${p.lesson}: call ${p.call.word}`);
    assert.ok(ph.has(p.reply.word), `${p.lesson}: reply ${p.reply.word}`);
  }
});

test('Greetings has 5 rounds; Expressions has 5 informal and 4 polite', () => {
  const g = buildRepliesDrill('greetings', keep).turns, e = buildRepliesDrill('expressions', keep).turns;
  assert.equal(g.filter(t => t.who === 'you').length, 5);
  assert.equal(e.filter(t => t.who === 'you').length, 9);
  assert.equal(e.filter(t => t.who === 'npc' && t.speaker === 'An older neighbour').length, 4);
  assert.deepEqual(buildRepliesDrill('numbers', keep).turns, []);
});

test('turns alternate call then reply, with three choices and exactly one right', () => {
  for (const id of ['greetings', 'expressions']) {
    const t = buildRepliesDrill(id, keep).turns;
    t.forEach((turn, i) => assert.equal(turn.who, i % 2 ? 'you' : 'npc', `${id} turn ${i}`));
    for (const turn of t.filter(x => x.who === 'you')) {
      assert.equal(turn.choices.length, 3);
      assert.equal(turn.choices.filter(c => c.ok).length, 1);
      assert.equal(new Set(turn.choices.map(c => c.fa)).size, 3, 'no duplicate choices');
      for (const c of turn.choices.filter(c => !c.ok)) assert.ok(c.why, 'wrong choices explain why');
    }
  }
});

test('a polite round offers the informal reply as a wrong choice when it differs', () => {
  const t = buildRepliesDrill('expressions', keep).turns;
  const i = t.findIndex(x => x.who === 'npc' && x.lat === 'Khaste nabaashid');
  const choices = t[i + 1].choices;
  assert.equal(choices.find(c => c.ok).lat, 'Salaamat baashid');
  assert.match(choices.find(c => c.lat === 'Salaamat baashi').why, /friend/);
});

test('pairsFor only returns that lesson', () => {
  assert.equal(pairsFor('greetings').length, 5);
  assert.ok(pairsFor('expressions').every(p => p.lesson === 'expressions'));
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/unit/pairs-data.test.mjs`
Expected: FAIL, "Cannot find module … pairs-data.js".

- [ ] **Step 3: Write `pairs-data.js`**

```js
// Everyday call-and-response pairs: someone says the call, everyone answers with the reply (#57).
// Pure, so Node can test it (tests/unit/pairs-data.test.mjs).
// `word` is the phonetic of the lesson word each side teaches. `polite` is the shomaa form,
// when the reply changes with register. Written by Claude; a native speaker should review it.
export const PAIRS = [
  { lesson: 'greetings',
    call: { fa: 'سلام علیکم', lat: 'Salaam aleykom', en: 'Peace be upon you', word: 'Salaam Aleykom' },
    reply: { fa: 'علیکم السلام', lat: 'Aleykom salaam', en: 'And upon you, peace', word: 'Aleykom Salaam' },
    tip: 'The reply turns the greeting around: salaam aleykom, aleykom salaam.' },
  { lesson: 'greetings',
    call: { fa: 'ممنون', lat: 'Mamnoon', en: 'Thanks', word: 'Mamnoon' },
    reply: { fa: 'خواهش میکنم', lat: 'Khaahesh mikonam', en: "You're welcome", word: 'Khaahesh Mikonam' } },
  { lesson: 'greetings',
    call: { fa: 'خوشبختم', lat: 'Khoshbakhtam', en: 'Nice to meet you', word: 'Khoshbakhtam' },
    reply: { fa: 'همچنین', lat: 'Hamchenin', en: 'Likewise', word: 'Hamchenin' } },
  { lesson: 'greetings',
    call: { fa: 'ببخشید', lat: 'Bebakhshid', en: 'Sorry', word: 'Bebakhshid' },
    reply: { fa: 'عیب نداره', lat: 'Eyb nadaare', en: 'No problem', word: 'Eyb Nadaare' } },
  { lesson: 'greetings',
    call: { fa: 'خداحافظ', lat: 'Khodaa haafez', en: 'Goodbye', word: 'Khodaa Haafez' },
    reply: { fa: 'به سلامت', lat: 'Be salaamat', en: 'Go safely', word: 'Be Salaamat' },
    tip: 'Khodaa haafez back works too. Be salaamat is what the one staying says.' },
  { lesson: 'expressions',
    call: { fa: 'چه خبر؟', lat: 'Che khabar?', en: "What's new?", word: 'Che Khabar?' },
    reply: { fa: 'سلامتی', lat: 'Salaamati', en: "All's well (lit: health)", word: 'Salaamati' },
    tip: 'Salaamati means "health": nothing new, all is well.' },
  { lesson: 'expressions',
    call: { fa: 'چطوری؟', lat: 'Chetori?', en: 'How are you?', word: 'Chetori?' },
    reply: { fa: 'خوبم، مرسی. تو چطوری؟', lat: 'Khubam, mersi. To chetori?', en: "I'm well, thanks. And you?", word: 'Khubam' },
    polite: { call: { fa: 'حالتون چطوره؟', lat: 'Haaletun chetore?', en: 'How are you? (polite)' },
              reply: { fa: 'خوبم، ممنون. شما چطورین؟', lat: 'Khubam, mamnoon. Shomaa chetorin?', en: "I'm well, thank you. And you? (polite)" } } },
  { lesson: 'expressions',
    call: { fa: 'خسته نباشی', lat: 'Khaste nabaashi', en: 'May you not be tired', word: 'Khaste Nabashi' },
    reply: { fa: 'سلامت باشی', lat: 'Salaamat baashi', en: 'May you be healthy', word: 'Salaamat Baashi' },
    polite: { call: { fa: 'خسته نباشید', lat: 'Khaste nabaashid', en: 'May you not be tired (polite)' },
              reply: { fa: 'سلامت باشید', lat: 'Salaamat baashid', en: 'May you be healthy (polite)' } } },
  { lesson: 'expressions',
    call: { fa: 'دستت درد نکنه', lat: 'Dastet dard nakone', en: 'Thank you (lit: may your hand not hurt)', word: 'Dastet Dard Nakone' },
    reply: { fa: 'نوش جان', lat: 'Nooshe jaan', en: 'Enjoy, my pleasure', word: 'Nooshe Jaan' },
    polite: { call: { fa: 'دستتون درد نکنه', lat: 'Dastetun dard nakone', en: 'Thank you (polite)' },
              reply: { fa: 'نوش جان', lat: 'Nooshe jaan', en: 'Enjoy, my pleasure' } },
    tip: 'Said after a meal you cooked. Nooshe jaan works with everyone.' },
  { lesson: 'expressions',
    call: { fa: 'عافیت باشه', lat: 'Aafiyat baashe', en: 'Bless you', word: 'Aafiyat Baashe' },
    reply: { fa: 'سلامت باشی', lat: 'Salaamat baashi', en: 'May you be healthy', word: 'Salaamat Baashi' },
    polite: { call: { fa: 'عافیت باشه', lat: 'Aafiyat baashe', en: 'Bless you' },
              reply: { fa: 'سلامت باشید', lat: 'Salaamat baashid', en: 'May you be healthy (polite)' } } },
];

const FRIEND = 'Your friend', ELDER = 'An older neighbour';
const defaultShuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const side = s => ({ fa: s.fa, lat: s.lat, en: s.en });

export function pairsFor(lessonId) { return PAIRS.filter(p => p.lesson === lessonId); }

// The Quick replies drill, in the checkpoint scenario shape: { title, setting, npc, turns }.
// Informal rounds first (one per pair, in teaching order), then a polite round for each pair that has one.
export function buildRepliesDrill(lessonId, shuffle = defaultShuffle) {
  const pairs = pairsFor(lessonId), turns = [];
  const round = (speaker, call, reply, wrong, tip) => {
    turns.push({ who: 'npc', speaker, ...side(call) });
    turns.push({ who: 'you', choices: shuffle([{ ...side(reply), ok: true, tip }, ...wrong]) });
  };
  // Two wrong choices: other pairs' replies, each saying which call it answers
  const others = (p, right, n) => shuffle(pairs.filter(q => q !== p && q.reply.fa !== right.fa && q.reply.fa !== p.reply.fa))
    .slice(0, n).map(q => ({ ...side(q.reply), why: `${q.reply.lat} answers ${q.call.lat} (${q.call.en.toLowerCase()}).` }));
  for (const p of pairs) round(FRIEND, p.call, p.reply, others(p, p.reply, 2), p.tip);
  for (const p of pairs.filter(q => q.polite)) {
    const informal = p.reply.fa !== p.polite.reply.fa
      ? [{ ...side(p.reply), why: `That's how you'd answer a friend. With elders and strangers: ${p.polite.reply.lat}.` }] : [];
    round(ELDER, p.polite.call, p.polite.reply, [...informal, ...others(p, p.polite.reply, 2 - informal.length)], p.tip);
  }
  return { title: 'Quick replies', setting: 'Someone says a set phrase. Answer the way Iranians do.', npc: FRIEND, turns };
}
```

- [ ] **Step 4: Run the unit test**

Run: `node --test tests/unit/pairs-data.test.mjs`
Expected: PASS (5 tests).

If "no duplicate choices" fails for an Expressions polite round: `others` excludes replies equal to the right one or the pair's own informal reply, so check the `fa` strings in `PAIRS` match exactly.

- [ ] **Step 5: Add to precache**

In `scripts/build-precache.js`, change the first `SHELL` line to:

```js
  "index.html", "app.js", "view.js", "learn-data.js", "example-data.js", "pairs-data.js", "number-order.js", "sync.js", "backend.js", "auth-messages.js", "culture.js", "style.css", "manifest.json",
```

- [ ] **Step 6: Run all unit tests, rebuild precache, commit**

```bash
npm run test:unit
node scripts/build-precache.js
git add pairs-data.js tests/unit/pairs-data.test.mjs scripts/build-precache.js precache-manifest.js
git commit -m "Add the call-and-response pairs and build the Quick replies drill from them (#57)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: unit tests PASS.

---

### Task 4: Pair-aware word pools and reply labels (pure helpers)

**Files:**
- Modify: `pairs-data.js` (append)
- Modify: `tests/unit/pairs-data.test.mjs` (append)

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/pairs-data.test.mjs` (and add `pairUnits, pairedPool, replyTo` to its import from `../../pairs-data.js`):

```js
test('pairUnits keeps each call with its reply, and every word appears once', () => {
  for (const id of ['greetings', 'expressions']) {
    const words = lesson(id).words, units = pairUnits(words, id);
    assert.equal(units.flat().length, words.length, `${id}: every word once`);
    assert.equal(new Set(units.flat()).size, words.length);
    // Two-word units are always [call, reply] of some pair
    for (const u of units.filter(u => u.length === 2))
      assert.ok(pairsFor(id).some(p => p.call.word === u[0].phonetic && p.reply.word === u[1].phonetic), u.map(w => w.phonetic).join(' + '));
  }
  // Every reply has a unit with a call, except a reply shared by two calls (it goes with the first)
  assert.equal(pairUnits(lesson('greetings').words, 'greetings').filter(u => u.length === 2).length, 5);
  assert.equal(pairUnits(lesson('expressions').words, 'expressions').filter(u => u.length === 2).length, 4);
});

test('pairedPool keeps pairs together and has at least n words', () => {
  const words = lesson('greetings').words;
  const pool = pairedPool(words, 'greetings', a => [...a].reverse(), 10);
  assert.ok(pool.length >= 10 && pool.length <= 11);
  const at = ph => pool.findIndex(w => w.phonetic === ph);
  for (const p of pairsFor('greetings')) if (at(p.reply.word) >= 0) assert.equal(at(p.call.word), at(p.reply.word) - 1, p.reply.word);
});

test('replyTo names every call a reply answers, spelled as their cards spell them', () => {
  assert.equal(replyTo('greetings:Hamchenin'), 'Khoshbakhtam');
  assert.equal(replyTo('expressions:Salaamat Baashi'), 'Khaste Nabashi / Aafiyat Baashe');
  assert.equal(replyTo('greetings:Salaam'), null);
});
```

- [ ] **Step 2: Run to see them fail**

Run: `node --test tests/unit/pairs-data.test.mjs`
Expected: FAIL, "pairUnits is not a function" (or a SyntaxError on the import).

- [ ] **Step 3: Implement**

Append to `pairs-data.js`:

```js
// A lesson's words as units: a call followed by its reply, or a single word. A reply shared by two
// calls goes with the first one. Units keep the lesson's word order.
export function pairUnits(words, lessonId) {
  const by = new Map(words.map(w => [w.phonetic, w])), used = new Set(), units = [];
  const pairs = pairsFor(lessonId);
  for (const w of words) {
    if (used.has(w)) continue;
    const p = pairs.find(p => p.call.word === w.phonetic);
    const r = p && by.get(p.reply.word);
    const u = r && !used.has(r) ? [w, r] : [w];
    u.forEach(x => used.add(x)); units.push(u);
  }
  return units;
}

// A random deck of at least n words that never splits a pair
export function pairedPool(words, lessonId, shuffle, n) {
  const out = [];
  for (const u of shuffle(pairUnits(words, lessonId))) { if (out.length >= n) break; out.push(...u); }
  return out;
}

// For a reply's word key ("lesson:Phonetic"): the calls it answers, spelled as their cards spell
// them, e.g. "Khoshbakhtam"; null otherwise
export function replyTo(key) {
  const [lessonId, ph] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
  const calls = pairsFor(lessonId).filter(p => p.reply.word === ph).map(p => p.call.word);
  return calls.length ? calls.join(' / ') : null;
}
```

Note: in `pairUnits`, a reply that comes *before* its call in the lesson list would be taken as a single word first. Task 2 puts every reply after its call, and the first test above checks it.

- [ ] **Step 4: Run tests**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
node scripts/build-precache.js
git add pairs-data.js tests/unit/pairs-data.test.mjs precache-manifest.js
git commit -m "Keep each call with its reply in word decks, and name what a reply answers (#57)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: The `replies` activity and `activitiesFor`

**Files:**
- Modify: `learn-data.js:224-231` (`ACTIVITIES`)
- Modify: `tests/unit/pairs-data.test.mjs` (append)

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/pairs-data.test.mjs`, and add `activitiesFor` to the import from `../../learn-data.js`:

```js
test('Quick replies is an activity only in lessons with pairs', () => {
  assert.ok(activitiesFor('greetings').some(a => a.id === 'replies'));
  assert.ok(activitiesFor('expressions').some(a => a.id === 'replies'));
  assert.ok(!activitiesFor('numbers').some(a => a.id === 'replies'));
  assert.deepEqual(activitiesFor('numbers').map(a => a.id), ['flashcard', 'quiz', 'listen', 'build', 'speak', 'grammar']);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/unit/pairs-data.test.mjs`
Expected: FAIL, "activitiesFor" is not exported.

- [ ] **Step 3: Implement**

In `learn-data.js`, insert into `ACTIVITIES` right after the `listen` entry:

```js
  { id: "replies", title: "Quick replies", desc: "Answer everyday phrases the way Iranians do", mins: 2, icon: "chat", isNew: true, only: ["greetings", "expressions"] },
```

and add right after the closing `];` of `ACTIVITIES`:

```js
// The activities a lesson offers: everything, except those limited to certain lessons
export const activitiesFor = lessonId => ACTIVITIES.filter(a => !a.only || a.only.includes(lessonId));
```

- [ ] **Step 4: Run tests and commit**

```bash
npm run test:unit
node scripts/build-precache.js
git add learn-data.js tests/unit/pairs-data.test.mjs precache-manifest.js
git commit -m "Add the Quick replies activity to Greetings and Expressions only (#57)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: unit tests PASS.

---

### Task 6: App wiring

**Files:**
- Modify: `app.js` (imports line 9; `openNextLesson` ~435; `startConvo` ~272; `start` ~445; `finish` ~493; view model ~587–661, ~728–760, ~802)

- [ ] **Step 1: Import the helpers**

After `import { numbersKnown, countingOrder } from './number-order.js';` add:

```js
import { buildRepliesDrill, pairsFor, pairedPool, replyTo } from './pairs-data.js';
```

- [ ] **Step 2: Use `activitiesFor` everywhere lesson progress is counted**

Replace each of these exactly:

`openNextLesson` (~line 435):
```js
    const l = ls.find(l => this.D.activitiesFor(l.id).some(a => !(p[l.id] || {})[a.id])) || ls[0];
```

Home "continue" card (~lines 587–590):
```js
    const nextL = lessons.find(l => D.activitiesFor(l.id).some(a => !prog(l.id)[a.id])) || lessons[0];
    const nextActs = D.activitiesFor(nextL.id);
    const nextA = nextActs.find(a => !prog(nextL.id)[a.id]) || nextActs[0];
    const ln = l => lessons.indexOf(l) + 1;
    v.cont = { n: ln(nextL), title: nextL.title, glyph: nextL.glyph, next: nextA.title, pct: Math.round(nextActs.filter(a => prog(nextL.id)[a.id]).length / nextActs.length * 100) + '%', open: () => this.nav({ name: 'lesson', id: nextL.id }) };
```

Chapter marks (~line 594) and stage rows (~line 613), in both places:
```js
      marks: D.activitiesFor(l.id).map(a => ({ bg: prog(l.id)[a.id] ? 'var(--color-accent)' : 'var(--color-divider)' })),
```
(keep each line's existing indentation and the code before/after `marks:` on that line unchanged)

Chapters done (~line 644):
```js
    v.chapterCount = lessons.length; v.chaptersDone = lessons.filter(l => D.activitiesFor(l.id).every(a => prog(l.id)[a.id])).length;
```

Lesson page activity list (~line 661): change `acts: D.ACTIVITIES.map(` to `acts: D.activitiesFor(l.id).map(`.

Leave `fullDone` (~line 802, `D.ACTIVITIES.slice(0, 3)`) as it is: the first three are still flashcard, quiz, listen.

Run: `grep -n "D.ACTIVITIES" app.js`
Expected: only the `fullDone` line.

- [ ] **Step 3: Start the drill with the conversation engine**

Replace `startConvo(id) { … }` (the 4 lines from `startConvo(id) {` through its closing `}`) with:

```js
  // Runs a scenario ({ title, setting, npc, turns }) on the conversation screen
  openConvo(sc, extra) {
    const ex = this.advanceNpc({ kind: 'convo', sc, items: sc.turns, i: 0, step: 0, log: [], wrongMsg: null, turnWrong: false, correct: 0, total: sc.turns.filter(t => t.who === 'you').length, missed: [], picked: [], showEn: true, lessonId: null, ...extra });
    this.setState({ ex, route: { name: 'exercise' } }); window.scrollTo(0, 0);
  }
  startConvo(id) {
    const sc = this.D.SCENARIOS[id]; if (sc) this.openConvo(sc, { scId: id });
  }
  // Quick replies (#57): the lesson's call-and-response pairs as a conversation
  startReplies(lessonId) {
    const sc = buildRepliesDrill(lessonId, a => this.shuffle(a));
    if (sc.turns.length) this.openConvo(sc, { act: 'replies', lessonId });
  }
```

At the top of `start(kind, lessonId, wordsOverride)`, as its first line:

```js
    if (kind === 'replies') return this.startReplies(lessonId);
```

- [ ] **Step 4: Keep pairs together in word decks**

In `start`, replace the `let pool = …` line with:

```js
    const paired = lesson && pairsFor(lessonId).length;
    let pool = wordsOverride || (ordered && lessonId === 'numbers' ? [...lesson.words]
      : paired ? pairedPool(lesson.words, lessonId, a => this.shuffle(a), 10) : this.shuffle(lesson.words).slice(0, 10));
```

- [ ] **Step 5: Record the drill as the lesson's `replies` activity**

In `finish(ex)`, replace:

```js
      if (lessonId && ex.kind !== 'review') progress[lessonId] = { ...(progress[lessonId] || {}), [ex.kind]: 1 };
      if (ex.kind === 'convo') progress['cp:' + ex.scId] = 1;
```

with:

```js
      if (lessonId && ex.kind !== 'review') progress[lessonId] = { ...(progress[lessonId] || {}), [ex.act || ex.kind]: 1 };
      if (ex.kind === 'convo' && ex.scId) progress['cp:' + ex.scId] = 1;
```

and in the same function's `result: { kind: ex.kind, scId: ex.scId, … }`, add `act: ex.act,` after `kind: ex.kind,`.

- [ ] **Step 6: Conversation screen: label, speaker**

In the `if (k === 'convo') {` view-model block, change `kindLabel: 'Conversation checkpoint'` to:

```js
kindLabel: ex.act === 'replies' ? 'Quick replies' : 'Conversation checkpoint'
```

and in its `log: ex.log.map(…)` change `name: you ? 'You' : ex.sc.npc` to:

```js
name: you ? 'You' : m.speaker || ex.sc.npc
```

- [ ] **Step 7: Results screen**

After the line `if (R.kind === 'convo') { v.R.kicker = 'Checkpoint complete'; … }`, add:

```js
      if (R.act === 'replies') { v.R.kicker = 'Quick replies complete'; v.R.again = () => this.startReplies(R.lessonId); v.R.primaryLabel = 'Back to chapter'; }
```

- [ ] **Step 8: Reply label on flashcards**

In the exercise view model, after `if (it.w) { const d = this.disp(it.w); Object.assign(X, d, { … }); }`, add:

```js
      X.replyTo = it.w ? replyTo(it.w.key) : null;
```

- [ ] **Step 9: Run unit tests**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
node scripts/build-precache.js
git add app.js precache-manifest.js
git commit -m "Run Quick replies on the conversation screen and keep pairs together in decks (#57)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: View hooks

**Files:**
- Modify: `view.js` (flashcard back ~line 308; lesson activity buttons ~line 250–258; convo log ~line 389; choices ~line 400)

- [ ] **Step 1: "Reply to …" on the flashcard back, plus test hooks**

On the card front, add `data-card-lat` to the Latin line, so it reads:

```js
          ${(v.show.lat) ? html`<span data-card-lat style="font-style:italic;font-size:17px;color:var(--color-neutral-700)">${v.X.lat}</span>` : null}
```

(the first `font-size:17px` Latin span inside the flashcard front, right after the 52px Persian span).

Replace the English line on the card back:

```js
          <span style="font-family:var(--font-heading);font-size:32px;font-weight:600;line-height:1.1">${v.X.en}</span>
```

with:

```js
          <span data-card-en style="font-family:var(--font-heading);font-size:32px;font-weight:600;line-height:1.1">${v.X.en}</span>
          ${(v.X.replyTo) ? html`<span data-reply-to style="font-size:13px;color:var(--color-accent-700)">Reply to <em>${v.X.replyTo}</em></span>` : null}
```

- [ ] **Step 2: Activity buttons carry their id and done state**

Find the lesson page's activity button (the element with `onClick=${a.start}` inside `v.L.acts.map`) and add these attributes to it:

```js
data-activity=${a.id} data-done=${a.done ? 'true' : 'false'}
```

Run: `grep -n "onClick=\${a.start}" view.js`
Expected: one match; that is the element to edit.

- [ ] **Step 3: Conversation hooks**

On the log message wrapper `<div style="display:flex;flex-direction:column;align-items:${m.align};gap:4px;animation:plup .2s ease">`, add:

```js
data-who=${m.who} data-speaker=${m.name} data-lat=${m.lat}
```

On the choices container `<div style="display:flex;flex-direction:column;gap:8px;padding-top:6px">` (the one holding "Your reply"), add `data-choices`. On each choice `<button onClick=${o.pick} …>` inside it, add `data-lat=${o.lat}`.

- [ ] **Step 4: Commit**

```bash
node scripts/build-precache.js
git add view.js precache-manifest.js
git commit -m "Show what a reply answers on its flashcard; add test hooks to the conversation (#57)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Spec names

**Files:**
- Modify: `docs/superpowers/specs/2026-11-15-quick-replies-design.md`

- [ ] **Step 1:** In the spec's Data section, replace the `replyOf` and `pairOrder` lines with:

```js
export function pairUnits(words, lessonId)            // -> [[call, reply], [word], …]
export function pairedPool(words, lessonId, shuffle, n) // -> a deck of ≥ n words that never splits a pair
export function replyTo(key)                           // -> "Khoshbakhtam" for "greetings:Hamchenin" (card spellings), else null
```

and in Tests, replace `pairOrder` with `pairedPool`.

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-11-15-quick-replies-design.md
git commit -m "Match the Quick replies spec to the helper names in the plan (#57)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Full verification

- [ ] **Step 1: Run every test**

Run: `npm test`
Expected: all unit tests PASS; all Playwright tests PASS, including `PER-51-quick-replies.spec.mjs` on desktop and phone.

- [ ] **Step 2: If the flashcard test saw no reply**

Change the seed in its `addInitScript` (try 1–20) until `replies.length` is above 0, re-run, and commit:

```bash
git add tests/regression/PER-51-quick-replies.spec.mjs
git commit -m "Pick a seed whose Greetings deck includes a pair

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 3: Look at it**

Run: `npx serve -l 5173 .` (or the server `playwright.config.mjs` uses), open Greetings and Expressions on a phone-width window, play Quick replies once each with English shown and hidden, and check the reply labels on flashcards.

- [ ] **Step 4: Ask the user before pushing**, then open the PR into `release/lessons-everyday-basics` titled "PER-51: Quick replies: everyday call-and-response pairs (#57)", and move #57 to "In review" on project board #4.
