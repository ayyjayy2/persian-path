# Grammar: lesson verb tables, grammar practice, grammar pages

Approved 2026-10-23.

## Goal

Teach grammar inside the daily lessons and in a set of grammar pages. Each lesson conjugates one verb that fits its vocabulary ("I eat, you eat, he/she eats…"). Learners practise picking the right form.

## Data (`learn-data.js`)

### `CONJ`: one verb per lesson, present tense, positive forms only

Each entry: `{ inf, infFa, en, rows }`. `rows` holds 6 rows in this order: I, you, he/she, we, you all, they. Each row is `{ sp, spLat, wr, wrLat }`: the spoken (Tehran) and written forms, script + Latin. Person labels are shared: man من, to تو, oo او, maa ما, shomaa شما, aan-haa آن‌ها.

| Lesson | Verb | Meaning |
|---|---|---|
| greetings | khub budan | to be well |
| expressions | balad budan | to know how |
| numbers | daashtan | to have |
| colors | didan | to see |
| family | zendegi kardan | to live |
| relationships | doost daashtan | to like / love |
| food | khordan | to eat |
| questions | khaastan | to want |
| pronouns | hastan | to be |
| home-life | khaabidan | to sleep |
| getting-around | raftan | to go |
| clothing | pushidan | to wear |
| days | aamadan | to come |
| verbs | goftan | to say |
| slang | fahmidan | to understand |

The forms are exactly the ones the user approved in chat on 2026-10-23.

### `GRAMMAR`: topic pages keyed by the existing path grammar items

Six topics: present tense, ezāfe, past tense, object marker *ro*, future & subjunctive, formal vs. colloquial. Each has an intro, sections with worked examples (fa, lat, en) and an optional table.

## UI

- **Lesson page.** A Grammar card sits under the Teacher's note. It shows the lesson's verb table in the current register (spoken or written), plus a link to the Present tense page.
- **Grammar activity.** It sits in `ACTIVITIES` as id `grammar`. It asks 6 questions, one per person. The prompt is the person plus the English meaning ("we · eat"). There are 4 choices: the correct form plus 3 other persons' forms of the same verb. Feedback names the ending ("we → -im"). The XP, results screen and `progress[lesson].grammar` work the same as the other activities.
- **Grammar pages.** A new route `{ name: 'grammar', id }`, opened from the path's grammar rows and from a new "Grammar · Dastoor دستور" list on the Learn page. The Present tense page lists all 15 lesson verb tables.

## Progress

- Lessons show 6 activities. The hard-coded `/ 5` in the Continue card becomes `ACTIVITIES.length`.
- Stage unlocking (`lessonDone`: flashcard, quiz, listen) is unchanged, so nothing re-locks.

## Out of scope

- Audio for verb forms. The OpenAI account has no credits, so the tables have no play buttons.
- Negative forms.

## Delivery

1. **PR 1:** `CONJ`, the lesson card, the grammar activity, the grammar route, the Present tense page, the Grammar list and the path rows. Path rows for topics not built yet stay inert.
2. **PR 2:** the other five topic pages. Past tense conjugations go to the user for review first.

## Testing

Check in Chrome on the local server with audio muted:
- every lesson card in both registers
- the grammar activity end to end
- the path and list links
- phone width
