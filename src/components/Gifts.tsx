import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Heart, Copy, Check, ExternalLink, Plane, Gift, Sparkles, Coins,
  CalendarDays, Coffee, AlarmClock, Backpack, Luggage, CircleCheck, Loader2, X,
} from 'lucide-react';
import {
  gifts, site,
  type PayMethod, type RegistryItem, type RegistryIcon,
} from '../config';
import { logFirestoreError, OperationType } from '../firebase';
import {
  subscribeToClaims, claimItem, isAlreadyClaimed, getMyClaims, rememberMyClaim,
  CLAIMS_COLLECTION, type Claims,
} from '../registry';

/** Copy-to-clipboard pill showing the handle with a copy affordance. */
function CopyHandle({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard may be blocked — the value is still shown for manual copy
    }
  };

  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-muted mb-1.5">{label}</p>
      <button
        type="button"
        onClick={copy}
        className="group w-full flex items-center justify-between gap-3 bg-cream-stone border border-stone-warm rounded-xl px-4 py-2.5 text-left hover:border-clay-rose/50 transition-colors"
      >
        <span className="font-mono text-sm text-stone-dark break-all">{value}</span>
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-wider text-clay-rose">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </span>
      </button>
    </div>
  );
}

function PayCard({ method }: { method: PayMethod }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-stone-warm rounded-2xl shadow-sm p-6 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-stone-dark">{method.label}</h3>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sand-gold bg-orange-50 border border-sand-gold/30 rounded-full px-2.5 py-1">
          {method.currency}
        </span>
      </div>

      <div className="space-y-3">
        {method.entries.map((entry) => (
          <CopyHandle key={entry.handle} value={entry.handle} label={entry.name} />
        ))}
      </div>

      <p className="mt-4 text-[11px] font-sans text-stone-muted text-center leading-relaxed">
        {method.type === 'upi' && 'Copy either UPI ID into any UPI app to send.'}
        {method.type === 'zelle' && 'Send via Zelle to either number in your banking app.'}
        {method.type === 'venmo' && 'Search either username in the Venmo app to send.'}
      </p>
    </motion.div>
  );
}

const ICONS: Record<RegistryIcon, typeof Gift> = {
  calendar: CalendarDays,
  coffee: Coffee,
  alarm: AlarmClock,
  backpack: Backpack,
  luggage: Luggage,
  gift: Gift,
};

/** Product photo, or an icon tile when there's no photo (or it fails to load). */
function ProductVisual({ item, muted, compact = false }: { item: RegistryItem; muted: boolean; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const Icon = ICONS[item.icon ?? 'gift'];
  const showPhoto = item.image && !failed;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${
        showPhoto ? 'bg-white' : 'bg-gradient-to-br from-cream-stone via-orange-50 to-sand-gold-light/50'
      }`}
    >
      {showPhoto ? (
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`w-full h-full object-contain ${compact ? 'p-1.5' : 'p-5'} transition-all duration-500 ${
            muted ? 'grayscale opacity-45' : ''
          }`}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center transition-opacity duration-500 ${muted ? 'opacity-40' : ''}`}>
          <div
            className={`rounded-full bg-white/85 border border-sand-gold/40 flex items-center justify-center shadow-sm ${
              compact ? 'w-10 h-10' : 'w-20 h-20'
            }`}
          >
            <Icon className={`text-clay-rose stroke-[1.25] ${compact ? 'w-5 h-5' : 'w-9 h-9'}`} />
          </div>
        </div>
      )}
    </div>
  );
}

type ItemState = 'available' | 'mine' | 'taken';

function RegistryCard({
  item, state, canClaim, onSelect,
}: {
  item: RegistryItem;
  state: ItemState;
  canClaim: boolean;
  onSelect: () => void;
}) {
  const taken = state !== 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors ${
        state === 'mine' ? 'border-emerald-300' : 'border-stone-warm'
      }`}
    >
      <div className="relative aspect-[4/3] border-b border-stone-warm/60">
        <ProductVisual item={item} muted={taken} />
        {taken && (
          <span
            className={`absolute top-3 right-3 text-[10px] font-sans font-bold uppercase tracking-widest rounded-full px-3 py-1 shadow-sm ${
              state === 'mine' ? 'bg-emerald-600 text-white' : 'bg-clay-dark text-cream'
            }`}
          >
            {state === 'mine' ? 'Taken · by you' : 'Taken'}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`font-display text-base font-semibold leading-snug ${
              taken ? 'line-through decoration-clay-rose/70 decoration-2 text-stone-muted' : 'text-stone-dark'
            }`}
          >
            {item.name}
          </h3>
          <span
            className={`shrink-0 text-xs font-mono font-bold ${
              taken ? 'line-through text-stone-muted' : 'text-sand-gold'
            }`}
          >
            {item.price}
          </span>
        </div>
        {item.note && (
          <p className={`mt-1 text-sm font-sans font-light leading-relaxed ${taken ? 'text-stone-muted/80' : 'text-stone-dark/80'}`}>
            {item.note}
          </p>
        )}

        <div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          {state === 'available' && (
            <>
              <button
                type="button"
                onClick={onSelect}
                disabled={!canClaim}
                title={canClaim ? undefined : 'Gift reservations are unavailable right now'}
                className="cursor-pointer inline-flex items-center gap-1.5 bg-clay-rose hover:bg-clay-dark text-white text-[11px] font-sans font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-clay-rose"
              >
                <Gift className="w-3.5 h-3.5" />
                I'll gift this
              </button>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-stone-muted hover:text-clay-rose transition-colors"
              >
                View on {item.store} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
          {state === 'mine' && (
            <>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-wider text-emerald-700">
                <CircleCheck className="w-4 h-4" />
                You're gifting this
              </span>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-clay-rose hover:text-clay-dark transition-colors"
              >
                Buy on {item.store} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
          {state === 'taken' && (
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-stone-muted">
              Already gifted by another guest
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ComingSoonCard({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-2 border-dashed border-stone-warm rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]"
    >
      <Sparkles className="w-6 h-6 text-sand-gold mb-3" />
      <h3 className="font-display text-base font-semibold text-stone-dark leading-snug">More coming soon</h3>
      <p className="mt-1.5 text-sm font-sans font-light text-stone-muted leading-relaxed">{text}</p>
    </motion.div>
  );
}

type DialogStatus = 'confirm' | 'saving' | 'error' | 'done' | 'taken';

/** Asks the guest to confirm before an item is marked taken for everyone. */
function FinalizeDialog({
  item, onClose, onClaimed,
}: {
  item: RegistryItem;
  onClose: () => void;
  onClaimed: (id: string) => void;
}) {
  const [decided, setDecided] = useState(false);
  const [status, setStatus] = useState<DialogStatus>('confirm');
  const panelRef = useRef<HTMLDivElement>(null);
  const saving = status === 'saving';

  // Lock page scroll, focus the dialog, and close on Escape (unless saving).
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saving, onClose]);

  const finalize = async () => {
    setStatus('saving');
    try {
      await claimItem(item.id);
      rememberMyClaim(item.id);
      onClaimed(item.id);
      setStatus('done');
    } catch (e) {
      if (isAlreadyClaimed(e)) {
        setStatus('taken');
      } else {
        logFirestoreError(e, OperationType.CREATE, `${CLAIMS_COLLECTION}/${item.id}`);
        setStatus('error');
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-stone-dark/55 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => !saving && onClose()}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="finalize-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-cream border border-stone-warm rounded-3xl shadow-2xl overflow-hidden outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close"
          className="cursor-pointer absolute top-3 right-3 p-1.5 rounded-full text-stone-muted hover:text-clay-rose hover:bg-white transition-colors disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* The item being finalized */}
        <div className="flex items-center gap-4 p-5 pr-12 border-b border-stone-warm/70 bg-white">
          <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-stone-warm/70">
            <ProductVisual item={item} muted={false} compact />
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-stone-dark leading-snug">{item.name}</p>
            <p className="text-xs font-mono font-bold text-sand-gold mt-0.5">
              {item.price} <span className="font-sans font-normal text-stone-muted">· {item.store}</span>
            </p>
          </div>
        </div>

        <div className="p-6">
          {(status === 'confirm' || status === 'saving' || status === 'error') && (
            <>
              <h2 id="finalize-title" className="font-serif italic text-2xl text-clay-dark leading-snug">
                Finalize this gift?
              </h2>
              <p className="mt-3 text-sm font-sans font-light text-stone-dark/85 leading-relaxed">
                Please finalize only if you've truly decided to gift this. Once you do, it's marked as
                taken for every guest so nobody buys the same thing, and you can't undo it from here.
              </p>

              <label className="mt-5 flex items-start gap-3 cursor-pointer select-none bg-white border border-stone-warm rounded-xl px-4 py-3 hover:border-clay-rose/50 transition-colors">
                <input
                  type="checkbox"
                  checked={decided}
                  onChange={(e) => setDecided(e.target.checked)}
                  disabled={saving}
                  className="mt-0.5 w-4 h-4 accent-clay-rose cursor-pointer"
                />
                <span className="text-sm font-sans text-stone-dark">Yes, I've decided to gift this</span>
              </label>

              {status === 'error' && (
                <p className="mt-4 text-xs font-sans text-clay-rose font-semibold bg-red-50/60 border border-clay-rose/20 rounded-xl px-4 py-3 leading-relaxed">
                  We couldn't save that just now. Please try again in a moment.
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="cursor-pointer text-[11px] font-sans font-bold uppercase tracking-wider text-stone-muted hover:text-stone-dark px-3 py-2 transition-colors disabled:opacity-40"
                >
                  Not yet
                </button>
                <button
                  type="button"
                  onClick={finalize}
                  disabled={!decided || saving}
                  className="cursor-pointer inline-flex items-center gap-1.5 bg-clay-rose hover:bg-clay-dark text-white text-[11px] font-sans font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md transition-all disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-clay-rose"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {saving ? 'Finalizing…' : 'Finalize gift'}
                </button>
              </div>
            </>
          )}

          {status === 'done' && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <h2 id="finalize-title" className="font-serif italic text-2xl text-clay-dark">
                Thank you so much!
              </h2>
              <p className="mt-3 text-sm font-sans font-light text-stone-dark/85 leading-relaxed">
                It's now marked as taken for everyone. If you haven't bought it yet, you can do that
                on {item.store} now.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-clay-rose hover:bg-clay-dark text-white text-[11px] font-sans font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md transition-all"
                >
                  Buy on {item.store} <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer text-[11px] font-sans font-bold uppercase tracking-wider text-stone-muted hover:text-stone-dark px-3 py-2 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {status === 'taken' && (
            <div className="text-center">
              <h2 id="finalize-title" className="font-serif italic text-2xl text-clay-dark">
                Someone beat you to it
              </h2>
              <p className="mt-3 text-sm font-sans font-light text-stone-dark/85 leading-relaxed">
                Another guest just finalized this gift. Please pick something else from the list.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer mt-6 inline-flex items-center gap-1.5 bg-clay-rose hover:bg-clay-dark text-white text-[11px] font-sans font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md transition-all"
              >
                Back to the list
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SectionHeading({ icon, kicker, title }: { icon: React.ReactNode; kicker: string; title: string }) {
  return (
    <div className="text-center mb-8">
      <div className="w-12 h-12 rounded-full bg-orange-50 border border-clay-rose/20 flex items-center justify-center text-clay-rose mx-auto mb-4">
        {icon}
      </div>
      <span className="font-serif italic text-base text-clay-rose block">{kicker}</span>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-dark uppercase tracking-tight">
        {title}
      </h2>
    </div>
  );
}

export default function Gifts({
  isFriendsAuthorized = false,
  showFund = true,
  backHref = '/',
}: {
  isFriendsAuthorized?: boolean;
  showFund?: boolean; // the Shagun / Honeymoon Fund cash section
  backHref?: string;
}) {
  const { registry, honeymoon } = gifts;
  const payMethods = honeymoon.methods.filter((m) => m.enabled);

  // Live claims shared by all guests, plus the ones this browser finalized.
  const [claims, setClaims] = useState<Claims>({});
  const [claimsReady, setClaimsReady] = useState(false);
  const [claimsUnavailable, setClaimsUnavailable] = useState(false);
  const [mine, setMine] = useState<string[]>(() => getMyClaims());
  const [selected, setSelected] = useState<RegistryItem | null>(null);

  useEffect(
    () =>
      subscribeToClaims(
        (next) => {
          setClaims(next);
          setClaimsReady(true);
          setClaimsUnavailable(false);
        },
        () => {
          setClaimsReady(true);
          setClaimsUnavailable(true);
        },
      ),
    [],
  );

  const itemState = (id: string): ItemState =>
    id in claims ? (mine.includes(id) ? 'mine' : 'taken') : 'available';
  const canClaim = claimsReady && !claimsUnavailable;

  // Friends see the casual "Honeymoon Fund"; family/general guests see "Shagun".
  const fundHeading = isFriendsAuthorized ? honeymoon.headingFriends : honeymoon.heading;
  const fundKicker = isFriendsAuthorized ? honeymoon.kickerFriends : honeymoon.kicker;
  const fundIcon = isFriendsAuthorized ? (
    <Plane className="w-5 h-5 stroke-[1.5]" />
  ) : (
    <Coins className="w-5 h-5 stroke-[1.5]" />
  );

  return (
    <div className="relative min-h-screen bg-cream text-stone-dark font-sans antialiased bg-jaali-rose">
      {/* Back link — preserve the active variant when returning to the invitation */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <a
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-stone-muted hover:text-clay-rose transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to invitation
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <span className="font-serif italic text-lg sm:text-xl text-clay-rose block mb-2">With Love</span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-stone-dark uppercase tracking-tight">
            Gifts &amp; Blessings
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="h-px w-8 bg-sand-gold/60" />
            <span className="text-sand-gold text-lg">✦ 𑁍 ✦</span>
            <span className="h-px w-8 bg-sand-gold/60" />
          </div>
        </motion.div>

        {/* Intro blessings note */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white border border-stone-warm rounded-3xl shadow-sm p-8 sm:p-10 text-center max-w-2xl mx-auto mb-16"
        >
          <div className="w-12 h-12 rounded-full bg-orange-50 border border-clay-rose/20 flex items-center justify-center text-clay-rose mx-auto mb-5">
            <Heart className="w-5 h-5 stroke-[1.5]" />
          </div>
          <p className="font-serif italic text-xl sm:text-2xl text-clay-dark leading-relaxed mb-3">
            Your presence is the greatest gift of all.
          </p>
          <p className="text-sm font-sans font-light text-stone-dark/85 leading-relaxed max-w-md mx-auto">
            {gifts.intro}
          </p>
        </motion.div>

        {/* Gift registry: one section per country */}
        {registry.enabled && registry.sections.length > 0 && (
          <section className="mb-16">
            <SectionHeading icon={<Gift className="w-5 h-5 stroke-[1.5]" />} kicker={registry.kicker} title={registry.heading} />

            {/* How it works */}
            <ol className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-6 mb-8 text-xs font-sans text-stone-dark/80">
              {['Choose a gift', 'Tap “I’ll gift this” and finalize', 'Buy it from the store'].map((step, i) => (
                <li key={step} className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 shrink-0 rounded-full bg-clay-rose/10 border border-clay-rose/25 text-clay-rose text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            {/* Jump links between countries */}
            {registry.sections.length > 1 && (
              <div className="flex items-center justify-center gap-2 mb-10">
                {registry.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#registry-${section.id}`}
                    className="text-[11px] font-sans font-bold uppercase tracking-wider text-stone-dark bg-white border border-stone-warm hover:border-clay-rose hover:text-clay-rose rounded-full px-4 py-2 transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            )}

            {claimsUnavailable && (
              <p className="max-w-xl mx-auto mb-8 text-center text-xs font-sans text-stone-dark/80 bg-orange-50/70 border border-sand-gold/30 rounded-xl px-4 py-3 leading-relaxed">
                Gift reservations are unavailable right now, so items can't be finalized at the moment.
                Please check back soon.
              </p>
            )}

            {registry.sections.map((section) => (
              <div key={section.id} id={`registry-${section.id}`} className="mb-12 last:mb-6 scroll-mt-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-stone-warm/70 pb-3 mb-6">
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-stone-dark uppercase tracking-tight">
                    {section.title}
                  </h3>
                  <span className="font-serif italic text-sm text-clay-rose">{section.kicker}</span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((item) => (
                    <RegistryCard
                      key={item.id}
                      item={item}
                      state={itemState(item.id)}
                      canClaim={canClaim}
                      onSelect={() => setSelected(item)}
                    />
                  ))}
                  {section.comingSoon && <ComingSoonCard text={section.comingSoon} />}
                </div>
              </div>
            ))}

            <p className="text-center text-[11px] font-sans text-stone-muted">
              Prices are approximate and may vary by store.
            </p>
          </section>
        )}

        {/* Shagun / Honeymoon fund */}
        {showFund && honeymoon.enabled && payMethods.length > 0 && (
          <section className="mb-12">
            <SectionHeading icon={fundIcon} kicker={fundKicker} title={fundHeading} />
            {honeymoon.blurb && (
              <p className="text-center text-sm font-sans font-light text-stone-dark/85 leading-relaxed max-w-xl mx-auto mb-8">
                {honeymoon.blurb}
              </p>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {payMethods.map((method) => (
                <PayCard key={method.type} method={method} />
              ))}
            </div>
          </section>
        )}

        {/* Footer flourish */}
        <div className="text-center mt-14">
          <span className="text-sand-gold text-2xl block mb-2">𑁍</span>
          <p className="font-serif italic text-xl text-clay-dark">
            {site.couple.bride} &amp; {site.couple.groom}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <FinalizeDialog
            key={selected.id}
            item={selected}
            onClose={() => setSelected(null)}
            onClaimed={(id) => setMine((prev) => (prev.includes(id) ? prev : [...prev, id]))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
