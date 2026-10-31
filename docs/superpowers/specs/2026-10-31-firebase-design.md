# Move hosting, sign-in and sync to Firebase

Approved 2026-10-31.

## Goal

Ship as often as we like, with nothing pausing. Today two things block that:

- The free Supabase project pauses after 7 days without activity, which takes sign-in and sync down.
- Netlify stops production deploys when the team runs out of credits (issue #51). That's why releases have to be batched.

Firebase replaces both. Hosting, sign-in (Auth) and data (Firestore) all run on the free Spark plan, which never pauses and has no limit on deploys.

## Decisions

- **Everything on Firebase:** hosting, Auth and Firestore.
- **Accounts:** the only account belongs to the user, so there's nothing to migrate server-side. The user signs up again in Firebase, and each device's local progress uploads on that first sign-in.
- **No email confirmation:** sign-up signs you in straight away.
- **Branch:** start `PER-42-firebase` from `PER-41-sync`. Sync round 1 (PR #52) never shipped, so the new PR carries both and replaces #52.

## Client library

Bundle the official Firebase SDK once into `vendor/firebase.js` with esbuild: `firebase/app`, `firebase/auth` and `firebase/firestore/lite`. Commit the output, so the app still has no build step and `vendor/supabase.js` and its `<script>` tag can go. The precache list picks the new file up, so the app still loads offline.

Firestore Lite is enough because the app keeps its own copy in localStorage and doesn't need live listeners or Firestore's offline cache.

Rejected:

- **Loading the SDK from gstatic:** the app couldn't load offline.
- **Calling the REST APIs directly:** we'd have to keep sessions alive and refresh tokens by hand.

## Data

One document per user: `users/{uid}`, with the same fields as the Supabase `profiles` row:

| Field | Value |
|---|---|
| `xp`, `streak`, `last_played_date` | as today |
| `completed_lessons` | the app's `progress` |
| `app_state` | the `SYNCED` fields (see the 2026-10-23 sync design) |
| `updated_at` | ISO string |

`pullRemote` reads the document with `getDoc`, and a missing document counts as "no data yet". `pushNow` writes the whole document with `setDoc`. The merge rules and `sync.js` don't change.

`firestore.rules`, checked into the repo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Sign-in

| Today (Supabase) | Firebase |
|---|---|
| `onAuthStateChange` | `onAuthStateChanged` (the user's `uid` replaces `id`) |
| `signInWithPassword` | `signInWithEmailAndPassword` |
| `signUp` plus "check your email" | `createUserWithEmailAndPassword`, which signs in straight away |
| `signOut` | `signOut` |

The rest of the sign-out flow stays as it is: upload, then clear My words once they're saved.

Firebase error codes get plain wording:

| Code | Message |
|---|---|
| `auth/invalid-credential` | Wrong email or password |
| `auth/email-already-in-use` | That email already has an account |
| `auth/weak-password` | At least 6 characters |
| `auth/invalid-email` | Check the email address |
| `auth/network-request-failed` | You're offline |
| anything else | Firebase's own message |

Firebase authorizes `localhost` and the project's `web.app`/`firebaseapp.com` domains by default, and preview channels fall under those.

## Hosting

`firebase.json` replaces `netlify.toml`:

- **Public directory:** `.`
- **Ignored:** `node_modules`, `docs`, `scripts`, `*.zip`, dotfiles, `firebase.json`, `firestore.rules`, `package*.json`
- **Predeploy:** `node scripts/build-precache.js`
- **Headers:** the same security headers as today, and `Cache-Control: no-cache` on `/sw.js` and `/precache-manifest.js`

GitHub Actions use `FirebaseExtended/action-hosting-deploy`, authenticated with a service-account secret that `firebase init hosting:github` creates:

- **Push to `main`:** deploy the live channel.
- **Pull request:** deploy a preview channel and comment its URL on the PR.

Each workflow runs `node scripts/build-precache.js` before it deploys.

The README documents the setup, which closes #51. Once this is live, batched releases are optional.

## Moving over (one time)

1. Merge the PR. Firebase Hosting goes live, and Netlify builds the same code one last time.
2. On each device, open the old Netlify site and sign in with the new Firebase account. Local progress uploads.
3. Open the new `*.web.app` address and sign in. Progress comes back. Reinstall the home screen app from there.
4. Turn off Netlify auto-deploys. The Supabase project can be deleted.

**Risk:** if Netlify credits are still exhausted, step 1's Netlify build is skipped and the old site can't upload. Check the Netlify status before merging.

## Setup

- **The user:** creates the Firebase project in Chrome while Claude drives, then runs `firebase login` once.
- **Claude:** registers the web app, turns on Email/Password sign-in, creates Firestore, deploys the rules and connects the GitHub Actions.

## Testing

- `node scripts/test-sync.mjs` still passes.
- On a preview channel, with two browser profiles:
  1. Sign up.
  2. Finish a lesson in profile A.
  3. Sign in on profile B: the progress appears.
  4. Sign out and back in.
  5. Load the app offline.
  6. Check the wrong-password and existing-email messages.

## Out of scope

- My words pictures (round 2, which could use Firebase Storage later)
- A custom domain
- Password reset
