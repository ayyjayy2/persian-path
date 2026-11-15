# Quick replies: everyday call-and-response pairs (#57)

Issue: #57 "Early lessons: teach the everyday call-and-response pairs (Che khabar? → Salaamati)". Milestone: Lessons: everyday basics. Branch `PER-51-call-and-response` off `release/lessons-everyday-basics`.

## Goal

A beginner learns the fixed reply Iranians give to everyday phrases, and practises answering without translating. Two parts:

1. **Taught in order.** In Greetings and Expressions, each call comes right before its reply in flashcards and quizzes. The reply's card says what it answers.
2. **Quick replies drill.** A new activity in those two lessons. Someone says the call; you pick the reply from three choices, with a tip when you're wrong. It runs on the checkpoint conversation engine.

## Decisions (from brainstorming, 2026-11-15)

| Question | Decision |
|---|---|
| Scope | Drill plus ordered pairs (issue option 2) |
| Audio for new phrases | Device voice fallback for now; real audio is #73 "Real audio for words that fall back to the device voice" |
| Register | Informal *to* rounds first, then polite *shomaa* rounds in the same drill, for pairs whose reply changes |
| Where | One drill per lesson, each using only that lesson's pairs |
| Engine | Reuse the checkpoint `convo` engine (no new screen) |
| New words | Added to the lessons, so every reply is met as a flashcard before the drill |

## Pairs

Spellings of words the app already teaches stay as they are (audio file names depend on them).

**Greetings**

| Call | Reply | Polite round |
|---|---|---|
| سلام علیکم *Salaam aleykom* | علیکم السلام *Aleykom salaam* | none (same) |
| ممنون *Mamnoon* | خواهش می‌کنم *Khaahesh mikonam* | none |
| خوشبختم *Khoshbakhtam* | همچنین *Hamchenin* | none |
| ببخشید *Bebakhshid* | عیب نداره *Eyb nadaare* | none |
| خداحافظ *Khodaa haafez* | به سلامت *Be salaamat* | none |

**Expressions**

| Call | Reply | Polite round |
|---|---|---|
| چه خبر؟ *Che khabar?* | سلامتی *Salaamati* | none |
| چطوری؟ *Chetori?* | خوبم، مرسی. تو چطوری؟ *Khubam, mersi. To chetori?* | حالتون چطوره؟ *Haaletun chetore?* → خوبم، ممنون. شما چطورین؟ *Khubam, mamnoon. Shomaa chetorin?* |
| خسته نباشی *Khaste nabashi* | سلامت باشی *Salaamat baashi* | خسته نباشید *Khaste nabaashid* → سلامت باشید *Salaamat baashid* |
| دستت درد نکنه *Dastet dard nakone* | نوش جان *Nooshe jaan* | دستتون درد نکنه *Dastetun dard nakone* → نوش جان *Nooshe jaan* |
| عافیت باشه *Aafiyat baashe* | سلامت باشی *Salaamat baashi* | عافیت باشه *Aafiyat baashe* → سلامت باشید *Salaamat baashid* |

Polite forms appear only in the drill (choices show their English), not as flashcards.

**New lesson words** (each with an example sentence in `example-data.js`):
- Greetings: *Salaam aleykom*, *Aleykom salaam*, *Hamchenin*, *Eyb nadaare*, *Be salaamat*
- Expressions: *Che khabar?*, *Salaamat baashi*, *Dastet dard nakone*, *Aafiyat baashe*

*Mersi* is not added as its own word; it appears inside the *Chetori?* reply.

All Persian, pronunciations and translations were written by Claude and should be checked by a native speaker before shipping.

## Data

New module `pairs-data.js` (pure, no DOM):

```js
export const PAIRS = [
  { lesson: 'expressions',
    call:  { fa, lat, en, word },        // word = phonetic of the lesson word, links the flashcard
    reply: { fa, lat, en, word },
    polite: { call: { fa, lat, en }, reply: { fa, lat, en } } | null,
    tip },                                 // optional culture note shown after a correct pick
  ...
];
export function pairsFor(lessonId)
export function buildRepliesDrill(lessonId, shuffle = defaultShuffle)  // -> { title, npc, turns }
export function pairUnits(words, lessonId)               // -> [[call, reply], [word], …]
export function pairedPool(words, lessonId, shuffle, n)  // -> a deck of ≥ n words that never splits a pair
export function replyTo(key)                            // -> "Khoshbakhtam" for "greetings:Hamchenin" (card spellings), else null
```

## The drill

`buildRepliesDrill` returns a scenario in the same shape as `SCENARIOS` entries.

1. **Informal rounds:** one per pair, in teaching order. Turn `{ who: 'npc', speaker: 'Your friend', fa, lat, en }`, then `{ who: 'you', choices }`.
2. **Polite rounds:** one per pair with `polite`, speaker "An older neighbour".
3. **Choices:** the right reply plus two other replies from the same lesson, shuffled. Each wrong choice has `why`: "*Hamchenin* answers *Khoshbakhtam* (nice to meet you)." In polite rounds one wrong choice is always the informal reply, with `why`: "That's how you'd answer a friend. With elders and strangers: *Salaamat baashid*."

Greetings: 5 rounds. Expressions: 5 informal + 4 polite = 9 rounds.

## App changes

- `ACTIVITIES` gets `{ id: 'replies', title: 'Quick replies', desc: 'Answer everyday phrases the way Iranians do', icon: (a chat icon from the app's set), only: ['greetings', 'expressions'] }`.
- New `activitiesFor(lesson)` returns the activities that apply to a lesson. It replaces direct uses of `D.ACTIVITIES` for lesson cards, progress dots, percentages, "next activity" and lesson completion in `app.js`.
- `start('replies', lessonId)` builds the drill and opens it with the existing `convo` exercise (`lessonId` set). Finishing marks `progress[lessonId].replies = 1` instead of `cp:<id>`. The results screen says "Quick replies complete" and "Back to lesson".
- The conversation view shows `turn.speaker` when present, otherwise the scenario's `npc`.
- Flashcard and quiz pools for Greetings and Expressions go through `pairOrder`, so each reply follows its call. Shuffled quizzes keep each pair adjacent.
- Flashcard English side for a reply shows "Reply to *Che khabar?*" under the meaning.
- `node scripts/build-precache.js` picks up `pairs-data.js`.

Existing learners: the new activity is undone, so Greetings and Expressions drop below 100% until it's played. Stage completion counts lessons, so a finished stage stays unlocked.

## Tests

- **Regression (written first):** `tests/regression/PER-51-quick-replies.spec.mjs`: open Expressions, start Quick replies, answer *Che khabar?* wrongly (see the tip), then with *Salaamati*, finish, and see the lesson's Quick replies marked done. Greetings flashcards show *Khoshbakhtam* right before *Hamchenin*, and *Hamchenin*'s card says "Reply to *Khoshbakhtam*".
- **Unit:** `tests/unit/pairs-data.test.mjs`: every pair's `word` exists in its lesson; drill round counts (5 and 9); each `you` turn has exactly one `ok` choice and three choices; polite rounds include the informal reply as a wrong choice; `pairedPool` puts every reply right after its call; lessons without pairs get no `replies` activity.
- Existing `example-data` tests cover the new words' examples.

## Out of scope

- Real audio recordings (#73).
- Pairs in other lessons or checkpoints.
- Native-speaker review (the user arranges it; fixes go in `pairs-data.js` / `learn-data.js`).
