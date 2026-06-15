import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, Copy, Check, ExternalLink, Plane, Gift } from 'lucide-react';
import { gifts, site, type PayMethod, type WishlistItem } from '../config';

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

      {method.name && (
        <p className="text-xs font-sans text-stone-muted mb-3">To: {method.name}</p>
      )}

      <CopyHandle value={method.handle} label={method.handleLabel} />

      <p className="mt-4 text-[11px] font-sans text-stone-muted text-center leading-relaxed">
        {method.type === 'upi' && 'Copy the UPI ID into any UPI app to send.'}
        {method.type === 'zelle' && 'Send via Zelle in your banking app to the number above.'}
        {method.type === 'venmo' && 'Search this username in the Venmo app to send.'}
      </p>
    </motion.div>
  );
}

function ItemCard({ item }: { item: WishlistItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-stone-warm rounded-2xl shadow-sm overflow-hidden flex flex-col"
    >
      {item.image && (
        <div className="aspect-[4/3] w-full overflow-hidden bg-cream-stone">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-stone-dark leading-snug">{item.name}</h3>
          {item.price && (
            <span className="shrink-0 text-[11px] font-mono font-bold text-sand-gold">{item.price}</span>
          )}
        </div>
        {item.note && (
          <p className="mt-1.5 text-sm font-sans font-light text-stone-dark/80 leading-relaxed">{item.note}</p>
        )}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 self-start text-[11px] font-sans font-bold uppercase tracking-wider text-clay-rose hover:text-clay-dark transition-colors"
          >
            View &amp; Gift <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
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

export default function Gifts() {
  const { wishlist, honeymoon } = gifts;
  const wishItems = wishlist.items.filter(Boolean);
  const payMethods = honeymoon.methods.filter((m) => m.enabled);

  return (
    <div className="relative min-h-screen bg-cream text-stone-dark font-sans antialiased bg-jaali-rose">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <a
          href="/"
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

        {/* Wishlist */}
        {wishlist.enabled && wishItems.length > 0 && (
          <section className="mb-16">
            <SectionHeading icon={<Gift className="w-5 h-5 stroke-[1.5]" />} kicker={wishlist.blurb} title={wishlist.heading} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishItems.map((item) => (
                <ItemCard key={item.name} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Honeymoon fund */}
        {honeymoon.enabled && payMethods.length > 0 && (
          <section className="mb-12">
            <SectionHeading icon={<Plane className="w-5 h-5 stroke-[1.5]" />} kicker="Sponsor Our Honeymoon!" title={honeymoon.heading} />
            <p className="text-center text-sm font-sans font-light text-stone-dark/85 leading-relaxed max-w-xl mx-auto mb-8">
              {honeymoon.blurb}
            </p>
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
    </div>
  );
}
