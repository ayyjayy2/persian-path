# Delete account (#77)

Issue: #77 "Profile: delete your account and its data". Milestone: Store readiness (part 1 of #59 "Ship Persian Learnin as a native app on the App Store (and Google Play)"). Branch `PER-54-delete-account` off `release/store-readiness`.

Apple guideline 5.1.1(v): an app that lets you create an account must let you delete it in the app.

## Decisions (2026-11-15)

| Question | Decision |
|---|---|
| Local progress after deleting | Cleared: the device goes back to a fresh guest profile, My words pictures included |
| Confirmation | A sheet that asks for the password. It is the "are you sure" and Firebase's recent-sign-in check in one |

## On screen

- Profile, under the "Signed in" box, signed-in only: a quiet **Delete account** link.
- It opens a sheet titled **Delete your account?**:
  "This deletes your account (*email*), the progress saved to it, and the progress on this device. It can't be undone."
  A password field ("Enter your password to confirm"), then **Cancel** and **Delete account**.
- Offline: the button is disabled and the sheet says "Connect to the internet to delete your account."
- Errors show in the sheet with the existing `authMessage` wording (wrong password, network).
- After deleting, the sheet closes and Profile shows "Your account has been deleted."

## Flow

`backend.js` exports `deleteAccount(password)`:

1. `reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(email, password))`. A wrong password throws and nothing is deleted.
2. `deleteDoc(users/{uid})`.
3. `deleteUser(auth.currentUser)`.

`app.js` `deleteAccount()`:

- Before step 1: cancel any pending upload and set `_pulled = null`, so `pushNow` can't re-save the data while deleting.
- On success: reset to a fresh guest profile (the same reset sign-out does, shared in one `resetToGuest()`), delete My words pictures, clear the password.
- On failure: show the message and restore `_pulled`, so sync carries on. If the document was deleted but the account wasn't, the next upload puts the document back, so nothing is lost by accident.

Firestore rules already allow only the owner to read and write (including delete) `users/{uid}`; no change.

## Vendored SDK

`scripts/firebase-entry.js` adds `EmailAuthProvider`, `reauthenticateWithCredential`, `deleteUser` (auth) and `deleteDoc` (firestore/lite). Rebuild with `npm run build:firebase`.

## Tests

Browser regression `tests/regression/PER-54-delete-account.spec.mjs`, with `backend.js` replaced by a stub that starts signed in and records calls:

- Profile shows Delete account when signed in, not as a guest.
- Wrong password: the error shows, the user is still signed in, nothing deleted.
- Right password: `deleteAccount` is called with it, the profile is a fresh guest (XP 0), "Your account has been deleted." shows, and no `saveDoc` happens after deleting.
- Offline: the button is disabled.

## Tasks

1. Regression test (fails first).
2. Firebase bundle: add the four exports and rebuild.
3. `backend.js` `deleteAccount`.
4. `app.js`: `resetToGuest()` shared with sign-out; `deleteAccount()`; sheet state and view model.
5. `view.js`: the link and the sheet.
6. Precache, full test run, look at it on a phone-sized screen.
