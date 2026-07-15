import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { site } from '../config';

/**
 * Full-screen vintage envelope that opens on click and reveals the invitation.
 * Shown once per browser session (see App).
 */
export default function EnvelopeIntro({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const t = (d: number) => (reduce ? 0.001 : d);

  // Lock background scroll while the intro is on screen.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(onOpen, reduce ? 350 : 2200);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  const W = 300;
  const H = 200;
  const halfW = W / 2;
  const halfH = H / 2;

  // Warm parchment tones for the envelope facets.
  const c = {
    inside: '#f8f1e2',
    flap: '#ece1c8',
    side: '#e5d9be',
    pocket: '#dfd1b1',
  };

  const triBase = { position: 'absolute' as const, width: 0, height: 0 };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-9 px-6 bg-cream bg-jaali-rose"
      initial={{ opacity: 1 }}
      animate={{ opacity: opening ? 0 : 1 }}
      transition={{ duration: t(0.6), delay: opening ? t(1.55) : 0 }}
      style={{ pointerEvents: opening ? 'none' : 'auto' }}
      aria-hidden={opening}
    >
      {/* Heading */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: opening ? 0 : 1, y: 0 }}
        transition={{ duration: t(0.8), delay: t(0.2) }}
      >
        <p className="font-serif italic text-lg sm:text-xl text-clay-rose">You&rsquo;re Invited</p>
        <div className="flex items-center justify-center gap-2 mt-1 text-sand-gold text-sm">
          <span className="h-px w-6 bg-sand-gold/50" /> ✦ <span className="h-px w-6 bg-sand-gold/50" />
        </div>
      </motion.div>

      {/* Envelope */}
      <div style={{ perspective: 1400 }}>
        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Open the invitation"
          onClick={handleOpen}
          onKeyDown={onKey}
          className="relative cursor-pointer outline-none rounded-sm"
          style={{ width: W, height: H, transformStyle: 'preserve-3d' }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={
            opening
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 1, scale: 1, y: [0, -6, 0] }
          }
          transition={
            opening
              ? { duration: t(0.4) }
              : {
                  opacity: { duration: t(0.8) },
                  scale: { duration: t(0.8) },
                  y: { duration: reduce ? 0 : 4.5, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' },
                }
          }
        >
          {/* Inside / back panel (revealed when the flap opens) */}
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              background: c.inside,
              boxShadow: '0 18px 45px -12px rgba(110,44,30,0.45), inset 0 0 0 1px rgba(201,147,66,0.35)',
            }}
          />

          {/* The letter that rises as it opens */}
          <motion.div
            className="absolute left-1/2 flex flex-col items-center justify-start text-center rounded-sm"
            style={{
              width: W - 44,
              height: H - 26,
              top: 14,
              x: '-50%',
              background: 'linear-gradient(#fffdf8, #fbf5e9)',
              boxShadow: '0 6px 18px -8px rgba(110,44,30,0.4), inset 0 0 0 1px rgba(201,147,66,0.30)',
            }}
            initial={false}
            animate={{ y: opening ? -96 : 0, zIndex: opening ? 25 : 6 }}
            transition={{ duration: t(0.7), delay: t(0.85), ease: 'easeOut' }}
          >
            <div className="pt-4">
              <p className="font-serif italic text-[11px] text-clay-rose">the wedding of</p>
              <p className="font-display text-lg text-clay-dark tracking-wide leading-tight mt-0.5">
                {site.couple.bride} &amp; {site.couple.groom}
              </p>
              <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-sand-gold font-semibold mt-1">
                {site.dateShort}
              </p>
            </div>
          </motion.div>

          {/* Left & right envelope facets */}
          <div style={{ ...triBase, left: 0, top: 0, zIndex: 15, borderTop: `${halfH}px solid transparent`, borderBottom: `${halfH}px solid transparent`, borderLeft: `${halfW}px solid ${c.side}` }} />
          <div style={{ ...triBase, right: 0, top: 0, zIndex: 15, borderTop: `${halfH}px solid transparent`, borderBottom: `${halfH}px solid transparent`, borderRight: `${halfW}px solid ${c.side}` }} />

          {/* Bottom pocket facet */}
          <div style={{ ...triBase, bottom: 0, left: 0, zIndex: 20, borderLeft: `${halfW}px solid transparent`, borderRight: `${halfW}px solid transparent`, borderBottom: `${halfH}px solid ${c.pocket}` }} />

          {/* Top flap — rotates open in 3D */}
          <motion.div
            className="absolute left-0 top-0"
            style={{
              width: 0,
              height: 0,
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              borderLeft: `${halfW}px solid transparent`,
              borderRight: `${halfW}px solid transparent`,
              borderTop: `${halfH}px solid ${c.flap}`,
              filter: 'drop-shadow(0 2px 2px rgba(110,44,30,0.18))',
            }}
            initial={false}
            animate={{ rotateX: opening ? 180 : 0, zIndex: opening ? 4 : 30 }}
            transition={{ duration: t(0.9), delay: t(0.25), ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Wax seal */}
          <motion.div
            className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-full"
            style={{
              width: 62,
              height: 62,
              x: '-50%',
              y: '-50%',
              zIndex: 40,
              background: 'radial-gradient(circle at 34% 30%, #b0472f, #7f2d1c 62%, #5f2013)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.4), 0 3px 8px rgba(95,32,19,0.45)',
            }}
            initial={false}
            animate={{ scale: opening ? 0 : 1, opacity: opening ? 0 : 1, rotate: opening ? -25 : 0 }}
            transition={{ duration: t(0.35) }}
          >
            <span
              className="font-display font-bold text-[15px]"
              style={{ color: '#eac986', textShadow: '0 1px 1px rgba(0,0,0,0.35)' }}
            >
              {site.couple.initials}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Tap hint */}
      <motion.div
        className="flex flex-col items-center gap-1"
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: t(0.4) }}
      >
        <motion.p
          className="font-sans text-[11px] uppercase tracking-[0.28em] text-stone-muted font-semibold"
          animate={reduce ? {} : { opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.2, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
        >
          Tap to open
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
