// Firebase sign-in errors in plain words. Pure, so Node can test it (scripts/test-auth-messages.mjs).
const OFFLINE = "You're offline. Sign in once you're connected — your progress is saved on this device meanwhile.";
const WRONG = 'Wrong email or password.';
const MESSAGES = {
  'auth/invalid-credential': WRONG, 'auth/invalid-login-credentials': WRONG, 'auth/wrong-password': WRONG, 'auth/user-not-found': WRONG,
  'auth/email-already-in-use': 'That email already has an account. Sign in instead.',
  'auth/weak-password': 'Use at least 6 characters for your password.',
  'auth/invalid-email': 'Check the email address.',
  'auth/network-request-failed': OFFLINE,
  'auth/too-many-requests': 'Too many tries. Wait a minute and try again.',
  'auth/missing-password': 'Enter your password.',
  'auth/admin-restricted-operation': "New accounts are turned off. Sign in with your existing account.",
  'auth/user-disabled': 'This account is turned off.',
};

export function authMessage(err) {
  return (err && MESSAGES[err.code]) || (err && err.message) || 'Something went wrong. Try again.';
}
