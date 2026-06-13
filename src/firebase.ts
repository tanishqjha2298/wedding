/**
 * Firebase bootstrap.
 *
 * All configuration comes from environment variables (Vite `import.meta.env`),
 * so the app is not tied to any single Firebase project. Copy `.env.example`
 * to `.env.local` and fill in your own project's values, or set them in your
 * Vercel project settings. See README.md for click-by-click setup.
 *
 * Note: Firebase web config values (apiKey, etc.) are NOT secrets — they are
 * meant to ship in the client. Security is enforced by Firestore rules
 * (see firestore.rules) and Authentication, not by hiding these keys.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Optional: a non-default named Firestore database. Leave unset to use "(default)".
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DB_ID;

// The Gmail address allowed to view the host RSVP dashboard.
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();

/** True only when the minimum Firebase config is present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  dbInstance = firestoreDatabaseId
    ? getFirestore(app, firestoreDatabaseId)
    : getFirestore(app);
  authInstance = getAuth(app);
  googleProviderInstance = new GoogleAuthProvider();
} else {
  console.warn(
    '[wedding] Firebase is not configured yet. RSVP saving and the host ' +
      'dashboard are disabled until you add your Firebase env vars. See README.md.',
  );
}

export const db = dbInstance;
export const auth = authInstance;
export const googleProvider = googleProviderInstance;

// Structured Firestore error reporting (kept for diagnostics).
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function logFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

/** Signs in the current user via the Google popup. */
export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not configured.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}
