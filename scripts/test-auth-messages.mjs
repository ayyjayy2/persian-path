// Tests for auth-messages.js. Run: node scripts/test-auth-messages.mjs
import assert from 'node:assert/strict';
import { authMessage } from '../auth-messages.js';

const t = (name, fn) => { try { fn(); console.log('ok  ', name); } catch (e) { console.log('FAIL', name); console.log(e.message); process.exitCode = 1; } };

t('wrong email or password, in every form Firebase reports it', () => {
  for (const code of ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-login-credentials'])
    assert.equal(authMessage({ code }), 'Wrong email or password.');
});
t('email already has an account', () => {
  assert.equal(authMessage({ code: 'auth/email-already-in-use' }), 'That email already has an account. Sign in instead.');
});
t('weak password', () => {
  assert.equal(authMessage({ code: 'auth/weak-password' }), 'Use at least 6 characters for your password.');
});
t('bad email', () => {
  assert.equal(authMessage({ code: 'auth/invalid-email' }), 'Check the email address.');
});
t('offline', () => {
  assert.equal(authMessage({ code: 'auth/network-request-failed' }), "You're offline. Sign in once you're connected — your progress is saved on this device meanwhile.");
});
t('too many tries', () => {
  assert.equal(authMessage({ code: 'auth/too-many-requests' }), 'Too many tries. Wait a minute and try again.');
});
t('unknown code falls back to the error message', () => {
  assert.equal(authMessage({ code: 'auth/something-new', message: 'Firebase: Something (auth/something-new).' }), 'Firebase: Something (auth/something-new).');
});
t('no code and no message', () => {
  assert.equal(authMessage(null), 'Something went wrong. Try again.');
});
