import { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'motion/react';
import { Heart, Loader2, PartyPopper, ArrowDown, HandCoins } from 'lucide-react';
import type { HoneymoonFund, PayType } from '../config';
import { logFirestoreError, OperationType } from '../firebase';
import { addPledge, formatMoney, PLEDGES_COLLECTION, type FundTotal } from '../fund';
import { primeAudio, playClink } from '../sound';

const METHOD_NAMES: Record<PayType, string> = { upi: 'UPI', zelle: 'Zelle', venmo: 'Venmo' };

/** Animates a number from its previous value (0 on first render) to the new one. */
function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(v),
    });
    from.current = value;
    return () => controls.stop();
  }, [value]);
  return <>{format(Math.round(shown))}</>;
}

type Status = 'idle' | 'done' | 'error';

export function FundBar({
  fund, totals, ready, unavailable, onSendNow,
}: {
  fund: HoneymoonFund;
  totals: FundTotal;
  ready: boolean;
  unavailable: boolean;
  onSendNow: () => void;
}) {
  const [amount, setAmount] = useState(''); // digits only
  const [status, setStatus] = useState<Status>('idle');
  const [saving, setSaving] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);

  const money = (n: number) => formatMoney(n, fund.currency);
  const symbol = fund.currency === 'INR' ? '₹' : '$';
  const value = amount ? parseInt(amount, 10) : 0;
  const tooBig = value > fund.maxPerEntry;
  const canDonate = ready && !unavailable && !saving && value >= 1 && !tooBig;

  const pct = fund.goal > 0 ? Math.min(100, (totals.total / fund.goal) * 100) : 0;
  const reached = totals.total >= fund.goal;
  const methodNames = fund.methods.map((m) => METHOD_NAMES[m]).join(' or ');

  const donate = async () => {
    if (!canDonate) return;
    const gift = value;
    primeAudio(); // must run inside the click so the browser allows sound
    playClink(); // the bar moves at the same moment (Firestore applies the write locally first)
    setSaving(true);
    setStatus('idle');
    try {
      await addPledge(fund.id, gift);
      setLastAmount(gift);
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
      className="bg-white border border-stone-warm rounded-2xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-display text-lg font-semibold text-stone-dark">{fund.title}</h3>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sand-gold bg-orange-50 border border-sand-gold/30 rounded-full px-2.5 py-1">
          {fund.currency}
        </span>
      </div>

      {/* Total raised */}
      <p className="font-serif text-3xl sm:text-4xl text-clay-dark leading-none">
        {unavailable ? <span className="text-stone-muted">…</span> : <CountUp value={totals.total} format={money} />}
        <span className="font-sans text-sm text-stone-muted ml-2">raised</span>
      </p>
      <p className="mt-1.5 text-xs font-sans text-stone-muted">
        of {money(fund.goal)} goal ·{' '}
        {totals.count === 0
          ? 'be the first to chip in!'
          : `${totals.count} ${totals.count === 1 ? 'contribution' : 'contributions'}`}
      </p>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-label={`${fund.title} honeymoon fund`}
        aria-valuemin={0}
        aria-valuemax={fund.goal}
        aria-valuenow={totals.total}
        className="relative mt-4 h-4 rounded-full bg-stone-warm/60 overflow-hidden"
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
        <span className="text-stone-muted">{money(fund.goal)}</span>
      </div>

      {/* Donate */}
      <div className="mt-5 flex items-stretch gap-2">
        <label className="flex-1 flex items-center bg-cream-stone border border-stone-warm rounded-xl px-3 focus-within:border-clay-rose focus-within:ring-1 focus-within:ring-clay-rose transition-all">
          <span className="text-stone-muted font-mono text-sm mr-1.5">{symbol}</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={`Amount in ${fund.currency}`}
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
        {fund.quickAmounts.map((q) => (
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
          The most we can add in one go is {money(fund.maxPerEntry)}.
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
      {status === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-3"
        >
          <p className="text-xs font-sans text-emerald-900 leading-relaxed flex gap-2">
            <Heart className="w-4 h-4 shrink-0 text-emerald-600 mt-px" />
            <span>
              Thank you! {money(lastAmount)} is on the bar. Now please send it via {methodNames} using the details below.
            </span>
          </p>
          <button
            type="button"
            onClick={onSendNow}
            className="cursor-pointer mt-2 ml-6 inline-flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-emerald-800 hover:text-emerald-950"
          >
            Show me where <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
