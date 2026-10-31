/**
 * Honeymoon fund progress.
 *
 * Each Donate tap adds a doc to fundPledges: { fund, amount, createdAt }.
 * Every guest's page listens to that collection and sums it per fund, so the
 * bars show the same live total for everyone. No names are stored (the
 * collection is publicly readable). Firestore rules cap each entry and only
 * the hosts can remove one (from #manage).
 */

import {
  addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, type Timestamp,
} from 'firebase/firestore';
import { db, logFirestoreError, OperationType } from './firebase';
import type { FundId } from './config';

export const PLEDGES_COLLECTION = 'fundPledges';

export interface Pledge {
  id: string;
  fund: FundId;
  amount: number;
  createdAt: Date | null; // null until the server timestamp lands
}

export interface FundTotal {
  total: number;
  count: number;
}

/** Subscribes to every pledge. Returns an unsubscribe function. */
export function subscribeToPledges(onChange: (pledges: Pledge[]) => void, onError: () => void) {
  if (!db) {
    onError();
    return () => {};
  }
  return onSnapshot(
    collection(db, PLEDGES_COLLECTION),
    (snapshot) => {
      const pledges: Pledge[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if ((data.fund === 'us' || data.fund === 'india') && typeof data.amount === 'number') {
          const at = data.createdAt as Timestamp | null | undefined;
          pledges.push({ id: d.id, fund: data.fund, amount: data.amount, createdAt: at ? at.toDate() : null });
        }
      });
      onChange(pledges);
    },
    (error) => {
      logFirestoreError(error, OperationType.LIST, PLEDGES_COLLECTION);
      onError();
    },
  );
}

export function totalsByFund(pledges: Pledge[]): Record<FundId, FundTotal> {
  const totals: Record<FundId, FundTotal> = { us: { total: 0, count: 0 }, india: { total: 0, count: 0 } };
  for (const p of pledges) {
    totals[p.fund].total += p.amount;
    totals[p.fund].count += 1;
  }
  return totals;
}

/** Records a contribution (whole currency units). */
export async function addPledge(fund: FundId, amount: number) {
  if (!db) throw new Error('Firebase is not configured.');
  await addDoc(collection(db, PLEDGES_COLLECTION), { fund, amount, createdAt: serverTimestamp() });
}

/** Host-only: removes a mistaken or joke entry. */
export async function removePledge(id: string) {
  if (!db) throw new Error('Firebase is not configured.');
  await deleteDoc(doc(db, PLEDGES_COLLECTION, id));
}

export function formatMoney(amount: number, currency: 'USD' | 'INR') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
