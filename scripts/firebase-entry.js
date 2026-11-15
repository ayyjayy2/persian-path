// The parts of the Firebase SDK the app uses. Bundled into vendor/firebase.js by `npm run build:firebase`
// so the app has no build step and loads offline. Rebuild only when upgrading Firebase.
export { initializeApp } from 'firebase/app';
export {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  EmailAuthProvider, reauthenticateWithCredential, deleteUser,
} from 'firebase/auth';
export { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore/lite';
