import { motion } from 'motion/react';
import { ArrowLeft, Gift, Heart } from 'lucide-react';
import { site } from '../config';

export default function Gifts() {
  return (
    <div className="relative min-h-screen bg-cream text-stone-dark font-sans antialiased bg-jaali-rose">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-stone-muted hover:text-clay-rose transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to invitation
        </a>
      </div>

      <section className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="font-serif italic text-lg sm:text-xl text-clay-rose block mb-2">
            With Love
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-stone-dark uppercase tracking-tight">
            Gifts &amp; Blessings
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="h-px w-8 bg-sand-gold/60" />
            <span className="text-sand-gold text-lg">✦ 𑁍 ✦</span>
            <span className="h-px w-8 bg-sand-gold/60" />
          </div>
        </motion.div>

        {/* Blessings note */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white border border-stone-warm rounded-3xl shadow-sm p-8 sm:p-12 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-orange-50 border border-clay-rose/20 flex items-center justify-center text-clay-rose mx-auto mb-6">
            <Heart className="w-6 h-6 stroke-[1.5]" />
          </div>

          <p className="font-serif italic text-xl sm:text-2xl text-clay-dark leading-relaxed mb-4">
            Your presence is the greatest gift of all.
          </p>
          <p className="text-sm font-sans font-light text-stone-dark/85 leading-relaxed max-w-md mx-auto">
            Truly — having you celebrate with us in Bikaner means the world. But if
            you'd like to bless us as we begin this new chapter, a few easy ways to
            do so will appear right here soon.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-sand-gold font-bold">
            <Gift className="w-3.5 h-3.5" />
            Registry details coming soon
          </div>
        </motion.div>

        {/* Footer flourish */}
        <div className="text-center mt-12">
          <span className="text-sand-gold text-2xl block mb-2">𑁍</span>
          <p className="font-serif italic text-xl text-clay-dark">
            {site.couple.bride} &amp; {site.couple.groom}
          </p>
        </div>
      </section>
    </div>
  );
}
