import { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'motion/react';
import { Heart, Loader2, PartyPopper, ArrowDown, HandCoins } from 'lucide-react';
import type { FundCurrency, HoneymoonPool, PayType } from '../config';
import { logFirestoreError, OperationType } from '../firebase';
import { addPledge, formatMoney, poolIn, PLEDGES_COLLECTION, type PoolTotals } from '../fund';
import { primeAudio, playClink } from '../sound';

const METHOD_NAMES: Record<PayType, string> = { upi: 'UPI', zelle: 'Zelle', venmo: 'Venmo' };
const CURRENCY_KEY = 'fundCurrency';

/** Remembered choice, else rupees for visitors on Indian time, else dollars. */
function initialCurrency(): FundCurrency {
  try {
    const saved = localStorage.getItem(CURRENCY_KEY);
    if (saved === 'USD' || saved === 'INR') return saved;
  } catch {
    // storage unavailable
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR';
  } catch {
    // Intl unavailable
  }
  return 'USD';
}

/**
 * Animates a number up from its previous value (0 on first render). When
 * `resetKey` changes (e.g. the currency switch) it jumps straight to the value.
 */
function CountUp({ value, format, resetKey }: { value: number; format: (n: number) => string; resetKey: string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  const lastKey = useRef(resetKey);
  useEffect(() => {
    if (lastKey.current !== resetKey) {
      lastKey.current = resetKey;
      from.current = value;
      setShown(value);
      return;
    }
    const controls = animate(from.current, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(v),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, resetKey]);
  return <>{format(shown)}</>;
}

type Status = 'idle' | 'done' | 'error';

export function HoneymoonFundBar({
  pool, totals, ready, unavailable, onSendNow,
}: {
  pool: HoneymoonPool;
  totals: PoolTotals;
  ready: boolean;
  unavailable: boolean;
  onSendNow: (currency: FundCurrency) => void;
}) {
  const [currency, setCurrency] = useState<FundCurrency>(initialCurrency);
  const [amount, setAmount] = useState(''); // digits only
  const [status, setStatus] = useState<Status>('idle');
  const [saving, setSaving] = useState(false);
  const [lastGift, setLastGift] = useState<{ amount: number; currency: FundCurrency } | null>(null);

  const opts = pool.currencies[currency];
  const money = (n: number) => formatMoney(n, currency);
  const symbol = currency === 'INR' ? '₹' : '$';
  const value = amount ? parseInt(amount, 10) : 0;
  const tooBig = value > opts.maxPerEntry;
  const canDonate = ready && !unavailable && !saving && value >= 1 && !tooBig;

  const raised = poolIn(totals, currency, pool.inrPerUsd);
  const goal = currency === 'USD' ? pool.goalUsd : pool.goalUsd * pool.inrPerUsd;
  const raisedUsd = poolIn(totals, 'USD', pool.inrPerUsd);
  const pct = pool.goalUsd > 0 ? Math.min(100, (raisedUsd / pool.goalUsd) * 100) : 0;
  const reached = raisedUsd >= pool.goalUsd;

  const switchCurrency = (c: FundCurrency) => {
    if (c === currency) return;
    setCurrency(c);
    setAmount('');
    setStatus('idle');
    try {
      localStorage.setItem(CURRENCY_KEY, c);
    } catch {
      // storage unavailable
    }
  };

  const donate = async () => {
    if (!canDonate) return;
    const gift = { amount: value, currency };
    primeAudio(); // must run inside the click so the browser allows sound
    playClink(); // the bar moves at the same moment (Firestore applies the write locally first)
    setSaving(true);
    setStatus('idle');
    try {
      await addPledge(gift.currency, gift.amount);
      setLastGift(gift);
      setAmount('');
      setStatus('done');
    } catch (e) {
      logFirestoreError(e, OperationType.CREATE, PLEDGES_COLLECTION);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-stone-warm rounded-2xl shadow-sm p-6 sm:p-7"
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="font-display text-base sm:text-lg font-semibold text-stone-dark whitespace-nowrap">Honeymoon Goal</h3>
        <div role="radiogroup" aria-label="Currency" className="inline-flex bg-cream-stone border border-stone-warm rounded-full p-1">
          {(['USD', 'INR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={currency === c}
              onClick={() => switchCurrency(c)}
              className={`cursor-pointer px-3 py-1 rounded-full text-[11px] font-sans font-bold tracking-wide whitespace-nowrap transition-all ${
                currency === c ? 'bg-clay-rose text-white shadow-sm' : 'text-stone-muted hover:text-stone-dark'
              }`}
            >
              <span className="hidden sm:inline">{c === 'USD' ? '$ ' : '₹ '}</span>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Total raised */}
      <p className="font-serif text-4xl sm:text-5xl text-clay-dark leading-none">
        {unavailable ? (
          <span className="text-stone-muted">…</span>
        ) : (
          <CountUp value={raised} format={money} resetKey={currency} />
        )}
        <span className="font-sans text-sm text-stone-muted ml-2">raised</span>
      </p>
      <p className="mt-2 text-xs font-sans text-stone-muted">
        of {money(goal)} goal ·{' '}
        {totals.count === 0
          ? 'be the first to chip in!'
          : `${totals.count} ${totals.count === 1 ? 'contribution' : 'contributions'}`}
      </p>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-label="Honeymoon fund"
        aria-valuemin={0}
        aria-valuemax={pool.goalUsd}
        aria-valuenow={Math.round(raisedUsd)}
        className="relative mt-5 h-4 rounded-full bg-stone-warm/60 overflow-hidden"
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sand-gold via-mandarin to-clay-rose overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="fund-shine absolute inset-0" />
        </motion.div>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-wider">
        {reached ? (
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <PartyPopper className="w-3.5 h-3.5" /> Goal reached, thank you!
          </span>
        ) : (
          <span className="text-stone-muted">{Math.floor(pct)}% there</span>
        )}
        <span className="text-stone-muted">{money(goal)}</span>
      </div>

      {/* Donate */}
      <div className="mt-6 flex items-stretch gap-2">
        <label className="flex-1 flex items-center bg-cream-stone border border-stone-warm rounded-xl px-3 focus-within:border-clay-rose focus-within:ring-1 focus-within:ring-clay-rose transition-all">
          <span className="text-stone-muted font-mono text-sm mr-1.5">{symbol}</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={`Amount in ${currency}`}
            placeholder="Amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 9));
              if (status !== 'idle') setStatus('idle');
            }}
            onKeyDown={(e) => e.key === 'Enter' && donate()}
            disabled={unavailable}
            className="w-full min-w-0 bg-transparent py-2.5 text-sm font-mono text-stone-dark outline-none placeholder:font-sans placeholder:text-stone-muted/70"
          />
        </label>
        <button
          type="button"
          onClick={donate}
          disabled={!canDonate}
          className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 bg-clay-rose hover:bg-clay-dark text-white text-[11px] font-sans font-bold uppercase tracking-wider px-5 rounded-xl shadow-sm transition-all disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-clay-rose"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HandCoins className="w-3.5 h-3.5" />}
          Donate
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        {opts.quickAmounts.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setAmount(String(q));
              if (status !== 'idle') setStatus('idle');
            }}
            disabled={unavailable}
            className={`cursor-pointer text-[11px] font-mono font-bold rounded-full border px-3 py-1 transition-colors disabled:opacity-45 ${
              value === q
                ? 'bg-clay-rose/10 border-clay-rose text-clay-rose'
                : 'bg-white border-stone-warm text-stone-dark hover:border-clay-rose/60'
            }`}
          >
            {money(q)}
          </button>
        ))}
      </div>

      {/* Messages */}
      {tooBig && (
        <p className="mt-3 text-xs font-sans text-clay-rose">
          The most we can add in one go is {money(opts.maxPerEntry)}.
        </p>
      )}
      {unavailable && (
        <p className="mt-3 text-xs font-sans text-stone-dark/80 bg-orange-50/70 border border-sand-gold/30 rounded-xl px-3 py-2.5 leading-relaxed">
          The fund tracker is unavailable right now. You can still send a gift using the details below.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-xs font-sans text-clay-rose font-semibold bg-red-50/60 border border-clay-rose/20 rounded-xl px-3 py-2.5 leading-relaxed">
          We couldn't add that just now. Please try again in a moment.
        </p>
      )}
      {status === 'done' && lastGift && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-3"
        >
          <p className="text-xs font-sans text-emerald-900 leading-relaxed flex gap-2">
            <Heart className="w-4 h-4 shrink-0 text-emerald-600 mt-px" />
            <span>
              Thank you! {formatMoney(lastGift.amount, lastGift.currency)} is on the bar. Now please send it via{' '}
              {pool.currencies[lastGift.currency].methods.map((m) => METHOD_NAMES[m]).join(' or ')} using the
              details below.
            </span>
          </p>
          <button
            type="button"
            onClick={() => onSendNow(lastGift.currency)}
            className="cursor-pointer mt-2 ml-6 inline-flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-emerald-800 hover:text-emerald-950"
          >
            Show me where <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      <p className="mt-5 text-[10px] font-sans text-stone-muted text-center">
        Dollar and rupee gifts fill the same bar · ₹{pool.inrPerUsd} = $1
      </p>
    </motion.div>
  );
}
