import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { site } from '../config';

/**
 * Full-screen vintage envelope that opens on click and reveals the invitation.
 */
export default function EnvelopeIntro({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  // Once the flap is roughly edge-on we drop it behind the letter so the letter
  // slides out in front (the z-order flips while the flap is nearly invisible).
  const [flapBehind, setFlapBehind] = useState(false);

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const t = (d: number) => (reduce ? 0.001 : d);

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
    window.setTimeout(() => setFlapBehind(true), reduce ? 0 : 520);
    window.setTimeout(onOpen, reduce ? 350 : 2350);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  // Envelope geometry
  const W = 300;
  const H = 200;
  const halfW = W / 2;
  const halfH = H / 2;

  // Warm parchment tones
  const c = {
    inside: '#f6efdf',
    flap: 'linear-gradient(155deg, #efe3ca 0%, #e5d7ba 100%)',
    side: '#e6dabf',
    pocket: '#ded0b0',
  };

  const easeOut = [0.16, 1, 0.3, 1] as const;
  const tri = { position: 'absolute' as const, width: 0, height: 0 };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-9 px-6 bg-cream bg-jaali-rose"
      initial={{ opacity: 1 }}
      animate={{ opacity: opening ? 0 : 1 }}
      transition={{ duration: t(0.7), delay: opening ? t(1.65) : 0, ease: 'easeInOut' }}
      style={{ pointerEvents: opening ? 'none' : 'auto' }}
      aria-hidden={opening}
    >
      {/* Heading */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: opening ? 0 : 1, y: 0 }}
        transition={{ duration: t(0.7), delay: t(0.15), ease: 'easeOut' }}
      >
        <p className="font-serif italic text-lg sm:text-xl text-clay-rose">You&rsquo;re Invited</p>
        <div className="flex items-center justify-center gap-2 mt-1 text-sand-gold text-sm">
          <span className="h-px w-6 bg-sand-gold/50" /> ✦ <span className="h-px w-6 bg-sand-gold/50" />
        </div>
      </motion.div>

      {/* Envelope */}
      <div>
        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Open the invitation"
          onClick={handleOpen}
          onKeyDown={onKey}
          className="relative cursor-pointer outline-none"
          style={{ width: W, height: H }}
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: opening ? 1.08 : 1, y: opening ? -14 : 0 }}
          transition={
            opening
              ? { duration: t(0.7), delay: t(1.6), ease: 'easeInOut' }
              : { duration: t(0.7), ease: 'easeOut' }
          }
        >
          {/* Inside / back panel */}
          <div
            className="absolute inset-0 rounded-[3px]"
            style={{
              zIndex: 1,
              background: c.inside,
              boxShadow:
                '0 22px 50px -14px rgba(110,44,30,0.42), inset 0 0 0 1px rgba(201,147,66,0.35)',
            }}
          />

          {/* Letter — slides up and out of the top */}
          <motion.div
            className="absolute left-1/2 flex flex-col items-center text-center rounded-[3px]"
            style={{
              zIndex: 12,
              width: W - 40,
              height: H - 22,
              top: 11,
              x: '-50%',
              background: 'linear-gradient(#fffdf8, #fbf5ea)',
              boxShadow: '0 8px 20px -10px rgba(110,44,30,0.45), inset 0 0 0 1px rgba(201,147,66,0.28)',
            }}
            initial={{ y: 0 }}
            animate={{ y: opening ? -118 : 0 }}
            transition={{ duration: t(0.85), delay: t(0.55), ease: easeOut }}
          >
            <div className="pt-5">
              <p className="font-serif italic text-[11px] text-clay-rose">the wedding of</p>
              <p className="font-display text-lg text-clay-dark tracking-wide leading-tight mt-0.5">
                {site.couple.bride} &amp; {site.couple.groom}
              </p>
              <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-sand-gold font-semibold mt-1.5">
                {site.dateShort}
              </p>
            </div>
          </motion.div>

          {/* Left & right facets */}
          <div style={{ ...tri, left: 0, top: 0, zIndex: 15, borderTop: `${halfH}px solid transparent`, borderBottom: `${halfH}px solid transparent`, borderLeft: `${halfW}px solid ${c.side}` }} />
          <div style={{ ...tri, right: 0, top: 0, zIndex: 15, borderTop: `${halfH}px solid transparent`, borderBottom: `${halfH}px solid transparent`, borderRight: `${halfW}px solid ${c.side}` }} />

          {/* Bottom pocket facet */}
          <div style={{ ...tri, bottom: 0, left: 0, zIndex: 20, borderLeft: `${halfW}px solid transparent`, borderRight: `${halfW}px solid transparent`, borderBottom: `${halfH}px solid ${c.pocket}` }} />

          {/* Top flap — real element clipped to a triangle, hinged at the top edge.
              Its own perspective wrapper keeps z-index ordering intact so it can
              drop behind the letter once opened. */}
          <div
            className="absolute left-0 top-0"
            style={{ zIndex: flapBehind ? 3 : 30, width: W, height: halfH, perspective: 900 }}
          >
            <motion.div
              style={{
                width: '100%',
                height: '100%',
                transformOrigin: 'top center',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                background: c.flap,
                boxShadow: '0 1px 1px rgba(110,44,30,0.12)',
              }}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: opening ? 178 : 0 }}
              transition={{ duration: t(0.8), delay: t(0.18), ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          {/* Wax seal */}
          <motion.div
            className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-full"
            style={{
              zIndex: 40,
              width: 62,
              height: 62,
              x: '-50%',
              y: '-50%',
              background: 'radial-gradient(circle at 34% 30%, #b0472f, #7f2d1c 62%, #5f2013)',
              boxShadow:
                'inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.4), 0 3px 8px rgba(95,32,19,0.45)',
            }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: opening ? 0.4 : 1,
              opacity: opening ? 0 : 1,
              y: opening ? 'calc(-50% - 10px)' : '-50%',
            }}
            transition={{ duration: t(0.3), ease: 'easeIn' }}
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
      <motion.p
        className="font-sans text-[11px] uppercase tracking-[0.28em] text-stone-muted font-semibold"
        animate={
          opening
            ? { opacity: 0 }
            : reduce
              ? { opacity: 1 }
              : { opacity: [0.5, 1, 0.5] }
        }
        transition={
          opening
            ? { duration: t(0.3) }
            : { duration: 2.4, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }
        }
      >
        Tap to open
      </motion.p>
    </motion.div>
  );
}
