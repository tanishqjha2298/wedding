/**
 * Honeymoon fund: one shared pool that guests give to in dollars or rupees.
 *
 * Each Donate tap adds a doc to fundPledges in the currency it was given in,
 * and every guest's page listens to the collection and sums it, converting
 * rupees at the fixed rate in config, so the bar shows the same live total
 * for everyone. No names are stored (the collection is publicly readable).
 * Firestore rules cap each entry and only the hosts can remove one (#manage).
 *
 * Stored shape: { fund: 'us' | 'india', amount, createdAt }, where 'us' means
 * the amount is in USD and 'india' means INR. (The field name dates from when
 * there were two separate bars; keeping it means earlier entries and the
 * published Firestore rules stay valid.)
 */

import {
  addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, type Timestamp,
} from 'firebase/firestore';
import { db, logFirestoreError, OperationType } from './firebase';
import type { FundCurrency } from './config';

export const PLEDGES_COLLECTION = 'fundPledges';

const STORED_KEY: Record<FundCurrency, 'us' | 'india'> = { USD: 'us', INR: 'india' };
const FROM_STORED: Record<string, FundCurrency | undefined> = { us: 'USD', india: 'INR' };

export interface Pledge {
  id: string;
  currency: FundCurrency;
  amount: number; // whole units of `currency`
  createdAt: Date | null; // null until the server timestamp lands
}

export interface PoolTotals {
  usd: number; // sum of dollar entries
  inr: number; // sum of rupee entries
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
        const currency = FROM_STORED[data.fund];
        if (currency && typeof data.amount === 'number') {
          const at = data.createdAt as Timestamp | null | undefined;
          pledges.push({ id: d.id, currency, amount: data.amount, createdAt: at ? at.toDate() : null });
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

export function poolTotals(pledges: Pledge[]): PoolTotals {
  const totals: PoolTotals = { usd: 0, inr: 0, count: pledges.length };
  for (const p of pledges) {
    if (p.currency === 'USD') totals.usd += p.amount;
    else totals.inr += p.amount;
  }
  return totals;
}

/** The whole pool expressed in one currency. */
export function poolIn(totals: PoolTotals, currency: FundCurrency, inrPerUsd: number) {
  return currency === 'USD' ? totals.usd + totals.inr / inrPerUsd : totals.usd * inrPerUsd + totals.inr;
}

/** Records a contribution in whole units of `currency`. */
export async function addPledge(currency: FundCurrency, amount: number) {
  if (!db) throw new Error('Firebase is not configured.');
  await addDoc(collection(db, PLEDGES_COLLECTION), {
    fund: STORED_KEY[currency],
    amount,
    createdAt: serverTimestamp(),
  });
}

/** Host-only: removes a mistaken or joke entry. */
export async function removePledge(id: string) {
  if (!db) throw new Error('Firebase is not configured.');
  await deleteDoc(doc(db, PLEDGES_COLLECTION, id));
}

export function formatMoney(amount: number, currency: FundCurrency) {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
