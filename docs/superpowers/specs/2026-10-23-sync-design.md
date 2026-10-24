# Sync all user data across devices, round 1 (issue #31)

Approved 2026-10-23.

## Goal

A signed-in learner sees the same progress on every device. Round 1 syncs everything except My words pictures. Pictures follow in round 2, which needs Supabase Storage.

## Today

`pullRemote` and `pushRemote` in `app.js` sync four fields to the `profiles` row: `xp`, `streak`, `last_played_date` and `completed_lessons` (the app's `progress`). Everything else in `PERSISTED` stays in localStorage `pl_state_v2` on one device.

## Storage

One new column on the existing `profiles` table. The user pastes this into the Supabase SQL editor before the change ships:

```sql
alter table public.profiles add column if not exists app_state jsonb not null default '{}'::jsonb;
```

The row-level security that already limits each user to their own `profiles` row covers the new column too. `app_state` holds:

| Key | Shape |
|---|---|
| `srs` | `{ [wordKey]: { b, t, u } }`. `u` is new: when this entry last changed (ms). |
| `mistakes` | `[wordKey]`, newest first, at most 40 (unchanged) |
| `mistakeAt` | `{ [wordKey]: ms }`. New: when each word was last missed. |
| `prefs`, `prefsU` | the prefs object, plus when it last changed (new) |
| `scriptSeen`, `vowelsSeen` | booleans |
| `grammarSeen` | `{ [topicId]: true }` |
| `todayXp`, `lastPlayedDate` | as today |
| `myWords` | `[{ id, en, lat, fa, img, created, u }]`. `u` is new: when the word was last saved. |
| `deletedWords` | `{ [id]: ms }`. New: when each My word was deleted. |

`mistakeAt`, `prefsU` and `deletedWords` join `PERSISTED`, so they are also saved locally. The sign-out reset clears them.

## Writing the new timestamps

- **srs:** every place that sets an entry also sets `u: Date.now()`. That's the review rating and the reset of missed words in `finish()`.
- **mistakes:** `finish()` sets `mistakeAt[k] = Date.now()` for each missed key.
- **prefs:** `setPref` also sets `prefsU`.
- **myWords:** `saveWord` sets `u`. `deleteWord` adds `deletedWords[id]` and still removes the word, its srs entry and its mistake as it does now.

Entries saved before this change have no `u`, so they count as time 0.

## Merging (`sync.js`)

A new ES module, `sync.js`, exports a pure `mergeState(local, remote)` that returns the merged synced fields. It has no DOM, Supabase or Preact code, so Node can test it directly.

| Data | Rule |
|---|---|
| `srs` | Per key, the entry with the larger `u` wins. On a tie, local wins. |
| `deletedWords` | Union; per id, the later time. |
| `myWords` | Per id, the larger `u` wins. Drop any word whose id is in the merged `deletedWords` with a time ≥ its `u`. Newest `created` first. |
| `mistakes`, `mistakeAt` | Union of both lists, sorted by `mistakeAt` (newest first), capped at 40. Drop keys of deleted My words (`my:<id>`). |
| `srs` (cleanup) | Drop keys of deleted My words. |
| `prefs` | The side with the larger `prefsU` wins whole. On a tie, local wins. |
| `scriptSeen`, `vowelsSeen` | Logical OR |
| `grammarSeen` | Union |
| `todayXp` | Same `lastPlayedDate` on both sides: the higher. Otherwise the value from the side with the newer `lastPlayedDate`. |

XP, streak, `lastPlayedDate` and `progress` keep today's rules in `pullRemote`: highest XP, the newer day's streak, and lesson progress combined.

## Flow

- **Pull** (on sign-in and each app open, from `onAuthStateChange`): fetch the row, `mergeState(local, row.app_state)`, set state, then push. On the first sign-in after this ships, the device's existing data uploads this way.
- **Push** (`pushRemote`, debounced 600 ms, skipped offline): upsert the existing fields plus `app_state`.
- **Offline:** unchanged. Changes save locally, and the existing `online` listener pushes on reconnect.
- **Errors:** a failed pull or push logs a warning and leaves local data untouched, as today.

## Out of scope

- My words pictures: round 2 (Supabase Storage)
- Live updates while two devices are open at once. A device picks up changes on its next app open or sign-in.

## Testing

- `node scripts/test-sync.mjs`, using `node:assert`, covers each merge rule: newer srs wins, delete beats an older edit, an edit after a delete brings the word back, mistakes union and cap, prefs by time, flags OR, `todayXp` same and different days, legacy entries without `u`.
- In Chrome on the local server, with audio muted: sign in on two browser profiles with a test account, change data on one, reopen the other, and check it arrives. That needs the user's SQL and a test account; otherwise mock `sb` in the page to check the push payload and the pull merge.

## Delivery

Commits on one batch branch, shipped when the user says to. The SQL must run in Supabase before the merge to main.
