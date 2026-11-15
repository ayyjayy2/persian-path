# Privacy policy page (#78)

Issue: #78 "Privacy policy page". Milestone: Store readiness (part 1 of #59 "Ship Persian Learnin as a native app on the App Store (and Google Play)"). Branch `PER-55-privacy-policy` off `release/store-readiness`.

## Decisions (2026-11-15)

| Question | Decision |
|---|---|
| Contact | GitHub issues link only; no email address published |
| Format | Standalone static `privacy.html`, no JavaScript, at https://persian-learnin.web.app/privacy.html |

## Facts it states (checked in the code)

- Signed-in users: email (Firebase Auth) and progress in Firestore `users/{uid}`: XP, streak, last played date, lessons done, and `SYNCED` in `sync.js` (review schedule, mistakes, settings, script/vowel/grammar pages seen, My words text, deleted words).
- Password: handled by Firebase Auth; the app never stores it.
- Device only: everything in guest mode, My words pictures (IndexedDB), speaking recordings (in memory as a blob URL, never saved or uploaded).
- Third parties loaded by the page: Google Fonts, Wikimedia (`upload.wikimedia.org`), OpenStreetMap tiles. They see the visitor's IP address.
- No ads, analytics or tracking.
- Deleting: Profile → Delete account (#77 "Profile: delete your account and its data"). Guests: delete the app or the site's data.
- Not aimed at children under 13.
- Contact: issues at github.com/ayyjayy2/persian-path.

## Changes

- `privacy.html`: the page, using `ds/classical.css` and `style.css`, with a "← Back to Persian Learnin" link to `/`.
- `sw.js`: navigations to `/privacy.html` are served as themselves (today every navigation gets `index.html`).
- `scripts/build-precache.js`: `privacy.html` in `SHELL`, so it opens offline.
- `view.js`: "Privacy policy" link at the bottom of Profile; "By creating an account you agree to the privacy policy." under the sign-up button.

## Tests

`tests/regression/PER-55-privacy-policy.spec.mjs`:
- `/privacy.html` shows the policy (heading, contact link) and links back to `/`.
- Profile's link and the sign-up sheet's link both lead to it.
- With the service worker in control and the browser offline, `/privacy.html` still shows the policy, not the app.
