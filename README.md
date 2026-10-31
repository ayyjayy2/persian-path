# Persian Learnin

A web app for learning Persian one lesson at a time: the script and its sounds, vocabulary with audio, grammar, conversation scenarios and culture articles. It installs to a phone's home screen and works offline.

Repo: [ayyjayy2/persian-path](https://github.com/ayyjayy2/persian-path)

## Running it locally

There's no build step. Serve the repo root with any static server and open it in a browser:

```sh
python3 -m http.server 8000
# or: npx serve .
```

Serve from the root, not a subfolder: the service worker and the manifest use absolute paths (`/sw.js`, `/audio/...`).

The service worker caches the app aggressively. When a change doesn't show up, run `node scripts/build-precache.js` (see below) and reload, or use DevTools → Application → Service workers → "Update on reload".

## How it's built

Plain ES modules with [Preact](https://preactjs.com/) and [htm](https://github.com/developit/htm) for the views. Every library is vendored into `vendor/` so the app loads offline without a CDN.

| File | What it holds |
|---|---|
| `index.html` | Entry point. Loads the vendored libraries, `culture.js` and `app.js`. |
| `app.js` | The `App` component: state, lesson and review logic, the Leitner review schedule, persistence, sign-in and sync. `renderVals()` builds the view model. |
| `view.js` | All screen markup, as htm templates. Converted from the v2 design export. |
| `learn-data.js` | Teaching content: lessons and words, stages, scenarios, letters, vowels, verb conjugations, grammar pages, pronunciation labels and the audio file list. |
| `culture.js` | Culture articles (flag, holidays and more), exposed as `window.CULTURE_ARTICLES`. |
| `sync.js` | `mergeState()`: the pure merge rules for two devices' progress. No DOM or network, so Node can test it. |
| `backend.js` | Firebase sign-in and each learner's synced document (`users/{uid}` in Firestore). The only file that talks to Firebase. |
| `auth-messages.js` | Plain-language wording for Firebase sign-in errors. |
| `vendor/firebase.js` | Generated. The Firebase SDK (app, auth, Firestore Lite) bundled by `npm run build:firebase` from `scripts/firebase-entry.js`. |
| `data.js` | v1 lesson data. The v2 app doesn't use it; `scripts/generate-audio.js` and `scripts/list-missing.js` still read it. |
| `ds/classical.css` | Design system tokens (colors, type, spacing) for the "Classical" look. |
| `style.css` | App-specific styles on top of the tokens. |
| `sw.js` | Service worker: precaches the app and all audio, caches fonts, article photos and map tiles as they're used. |
| `precache-manifest.js` | Generated. The list of files the service worker caches, plus a content hash. |
| `manifest.json`, `images/` | Install-to-home-screen metadata and icons. |
| `audio/` | One `.wav` per word, named `<english>-<phonetic>.wav`. |

### Where progress is stored

- **On the device:** `localStorage` key `pl_state_v2` holds XP, streak, lesson progress, review schedule, mistakes, settings and My words. Pictures for My words live in IndexedDB (`pl_media`) so they can't fill the localStorage quota.
- **In the cloud:** signed-in learners sync through Firebase: Auth for email and password sign-in, and one Firestore document per learner, `users/{uid}`, with `xp`, `streak`, `last_played_date`, `completed_lessons` and `app_state`. `firestore.rules` lets each learner read and write only their own document. The merge rules are in [the sync design](docs/superpowers/specs/2026-10-23-sync-design.md).

### Adding content

- **A word:** add a tuple to `RAW` in `learn-data.js`: `[persian, phonetic, english, example, writtenForm?, writtenPhonetic?]`. Drop its `.wav` in `audio/` and add the file name, without `.wav`, to the `AUDIO` set. `audioFile(english, phonetic)` in `learn-data.js` gives the expected name.
- **A grammar page:** add an entry to `GRAMMAR` in `learn-data.js`.
- **An app icon:** icon files carry a version suffix (`-v2`) because iOS caches home screen icons by URL. Bump the suffix in `images/`, `index.html` and `manifest.json` together.

After adding files or audio, run `node scripts/build-precache.js` so offline users get them.

## Scripts

| Command | What it does |
|---|---|
| `node scripts/build-precache.js` | Rewrites `precache-manifest.js` from the current files. Deploys run it automatically. |
| `node scripts/test-sync.mjs` | Tests the sync merge rules in `sync.js`. |
| `node scripts/test-auth-messages.mjs` | Tests the sign-in error wording in `auth-messages.js`. |
| `npm run build:firebase` | Rebuilds `vendor/firebase.js`. Only needed when upgrading Firebase (bump the pinned version in `package.json` first). |
| `npm run generate-audio` | Generates missing word audio with OpenAI text-to-speech. Needs `OPENAI_API_KEY` in `.env` (copy `.env.example`). |
| `node scripts/list-missing.js` | Lists v1 words with no audio file. |

## Deploying

The site is on Firebase Hosting at <https://persian-learnin.web.app> (Firebase project `persian-learnin`).

- **Live:** every push to `main` deploys (`.github/workflows/firebase-hosting-merge.yml`). There's no deploy limit, so merge whenever a change is ready.
- **Previews:** every PR deploys to one shared preview channel, `next`, so the link stays the same. It shows whichever PR pushed last, and the link is posted on each PR (`.github/workflows/firebase-hosting-pull-request.yml`). The channel expires 30 days after its last deploy.
- **Both workflows** run `node scripts/build-precache.js` first, and authenticate with the `FIREBASE_SERVICE_ACCOUNT_PERSIAN_LEARNIN` secret (service account `github-deploy`).
- **Firestore rules** don't deploy with the site. After changing `firestore.rules`, run `firebase deploy --only firestore:rules`.
- **Manual deploy, if ever needed:** `firebase deploy --only hosting`.

The app used to be on Netlify (persian-learnin.netlify.app) with Supabase. See [the Firebase move](docs/superpowers/specs/2026-10-31-firebase-design.md) for why it moved and how devices moved their progress.

## Working conventions

- Branches and PRs are named `PER-XX-short-description`, with PR titles like `PER-XX: What it does`.
- Bigger features get a design in `docs/superpowers/specs/` and a step-by-step plan in `docs/superpowers/plans/` before any code.

## Documents

**Designs**
- [Grammar: lesson verb tables, grammar practice, grammar pages](docs/superpowers/specs/2026-10-23-grammar-design.md)
- [Sync all user data across devices, round 1](docs/superpowers/specs/2026-10-23-sync-design.md)
- [Move hosting, sign-in and sync to Firebase](docs/superpowers/specs/2026-10-31-firebase-design.md)

**Implementation plans**
- [Grammar PR 1](docs/superpowers/plans/2026-10-23-grammar-pr1.md)
- [Sync all user data, round 1](docs/superpowers/plans/2026-10-23-sync-round1.md)
- [Move to Firebase](docs/superpowers/plans/2026-10-31-firebase.md)

## Versions

- **v1.0.0:** the original Duolingo-style app in vanilla JS.
- **v2.0.0:** the "Classical" redesign on Preact and htm, with spaced review, grammar, scenarios and offline support.
