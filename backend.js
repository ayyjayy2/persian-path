// Sign-in and each learner's synced document, on Firebase. The only file that talks to Firebase;
// app.js decides what to sync and sync.js how to merge it.
import {
  initializeApp, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, getFirestore, doc, getDoc, setDoc,
} from './vendor/firebase.js';

const app = initializeApp({
  apiKey: 'AIzaSyDWQMtoMoOUOxBzl_85f3PKZmNhe6N8mb8',
  authDomain: 'persian-learnin.firebaseapp.com',
  projectId: 'persian-learnin',
  storageBucket: 'persian-learnin.firebasestorage.app',
  messagingSenderId: '573429612507',
  appId: '1:573429612507:web:8902d4c4fa88ff2097b1fe',
});
// Stay signed in across app opens; fall back to localStorage where IndexedDB is unavailable
const auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] });
const db = getFirestore(app);
const userDoc = id => doc(db, 'users', id);

// The app only needs these two fields; keep Firebase's User object out of Preact state
const toUser = u => (u ? { id: u.uid, email: u.email } : null);

// Firebase only reports a stored session after a network check, which can take a while on a weak
// connection. The last known user lets the app show who's signed in straight away; app.js still
// waits for onUser before syncing.
const LAST_USER = 'pl_user';
export function lastUser() {
  try { return JSON.parse(localStorage.getItem(LAST_USER)); } catch (e) { return null; }
}
// Calls back with the signed-in user (or null) once Firebase knows, and on every change
export const onUser = cb => onAuthStateChanged(auth, u => {
  const user = toUser(u);
  try { user ? localStorage.setItem(LAST_USER, JSON.stringify(user)) : localStorage.removeItem(LAST_USER); } catch (e) {}
  cb(user);
});
export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
// Signs the new account in straight away (no email confirmation)
export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const signOutUser = () => signOut(auth);

// The user's synced fields, or null before their first upload
export async function loadDoc(id) {
  const snap = await getDoc(userDoc(id));
  return snap.exists() ? snap.data() : null;
}
// Replaces the whole document. The JSON round trip drops undefined values, which Firestore rejects.
export const saveDoc = (id, data) => setDoc(userDoc(id), JSON.parse(JSON.stringify(data)));
