/**
 * Gift registry claims.
 *
 * When a guest finalizes a gift, a doc is created at registryClaims/{itemId}.
 * Every guest's page listens to that collection, so the item shows as taken
 * for everyone. Firestore rules allow creating a claim but never changing or
 * removing it publicly; only the hosts can release one (from #manage).
 */

import {
  collection, deleteDoc, doc, onSnapshot, runTransaction, serverTimestamp, type Timestamp,
} from 'firebase/firestore';
import { db, logFirestoreError, OperationType } from './firebase';

export const CLAIMS_COLLECTION = 'registryClaims';

/** itemId → when it was finalized (null until the server timestamp lands). */
export type Claims = Record<string, Date | null>;

/** Subscribes to all claims. Returns an unsubscribe function. */
export function subscribeToClaims(onChange: (claims: Claims) => void, onError: () => void) {
  if (!db) {
    onError();
    return () => {};
  }
  return onSnapshot(
    collection(db, CLAIMS_COLLECTION),
    (snapshot) => {
      const next: Claims = {};
      snapshot.forEach((d) => {
        const at = d.data().claimedAt as Timestamp | null | undefined;
        next[d.id] = at ? at.toDate() : null;
      });
      onChange(next);
    },
    (error) => {
      logFirestoreError(error, OperationType.LIST, CLAIMS_COLLECTION);
      onError();
    },
  );
}

const ALREADY_CLAIMED = 'already-claimed';

export const isAlreadyClaimed = (e: unknown) =>
  (e as { code?: string } | null)?.code === ALREADY_CLAIMED;

/** Marks an item as taken. The first guest wins; later attempts throw isAlreadyClaimed. */
export async function claimItem(itemId: string) {
  if (!db) throw new Error('Firebase is not configured.');
  const firestore = db;
  const ref = doc(firestore, CLAIMS_COLLECTION, itemId);
  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists()) throw Object.assign(new Error('Already claimed'), { code: ALREADY_CLAIMED });
    tx.set(ref, { itemId, claimedAt: serverTimestamp() });
  });
}

/** Host-only: makes a finalized item available again. */
export async function releaseItem(itemId: string) {
  if (!db) throw new Error('Firebase is not configured.');
  await deleteDoc(doc(db, CLAIMS_COLLECTION, itemId));
}

// The gifts this browser finalized, so a guest sees "You're gifting this" on theirs.
const MINE_KEY = 'registryMine';

export function getMyClaims(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(MINE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberMyClaim(itemId: string) {
  try {
    const mine = new Set(getMyClaims());
    mine.add(itemId);
    localStorage.setItem(MINE_KEY, JSON.stringify([...mine]));
  } catch {
    // storage unavailable (private mode); the item still shows as taken
  }
}
