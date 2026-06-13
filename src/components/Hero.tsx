import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Calendar, MapPin } from 'lucide-react';
import { site } from '../config';
import heroImg from '../assets/images/experience3.jpg';

interface HeroProps {
  onScrollToRsvp: () => void;
}

function useCountdown(targetISO: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const target = new Date(targetISO).getTime();

    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetISO]);

  return timeLeft;
}

export default function Hero({ onScrollToRsvp }: HeroProps) {
  const timeLeft = useCountdown(site.weddingStartISO);

  const countdownUnits = [
    { value: timeLeft.days, label: 'days' },
    { value: String(timeLeft.hours).padStart(2, '0'), label: 'hrs' },
    { value: String(timeLeft.minutes).padStart(2, '0'), label: 'mins' },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 md:py-12 overflow-hidden bg-cream bg-jaali-rose">

      {/* Decorative traditional corner borders */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-sand-gold pointer-events-none opacity-60" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-sand-gold pointer-events-none opacity-60" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-sand-gold pointer-events-none opacity-60" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-sand-gold pointer-events-none opacity-60" />

      {/* Top banner: date + venue */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="w-full flex items-center justify-between gap-4 z-20 max-w-6xl px-2 sm:px-4 pt-2"
      >
        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.25em] text-clay-rose font-semibold font-sans">
          <Calendar className="w-4 h-4 shrink-0" />
          {site.dateShort}
        </span>

        <a
          href={site.venue.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.25em] text-sand-gold font-semibold font-sans hover:text-clay-rose transition-colors"
          title="Open the venue in Google Maps"
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{site.venue.name}, Bikaner</span>
          <span className="sm:hidden">{site.venue.name}</span>
        </a>
      </motion.div>

      {/* Main content */}
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 md:gap-12 items-center my-auto py-6 z-10">

        {/* Left: editorial typography */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8 px-2 sm:px-4">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50/70 border border-mandarin/15 text-mandarin text-[10px] md:text-xs font-sans tracking-widest uppercase font-semibold"
          >
            ✦ A Royal Rajasthani Wedding
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.2 }}
            className="font-serif italic text-lg sm:text-2xl text-stone-muted tracking-wide"
          >
            Together with their families, you are invited to the wedding of
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center lg:items-start w-full"
          >
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight text-stone-dark leading-none">
              {site.couple.bride}
            </h1>

            <div className="relative w-full py-4 flex items-center justify-center lg:justify-start">
              <span className="absolute h-px w-48 bg-stone-warm" />
              <span className="font-serif italic text-2xl md:text-3xl bg-cream z-10 px-6 text-clay-rose font-medium">
                &amp;
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight text-stone-dark leading-none">
              {site.couple.groom}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="text-xs sm:text-sm font-sans font-light tracking-wide text-stone-dark/85 max-w-md leading-relaxed"
          >
            With joyful hearts, we request the honour of your presence as we
            exchange our vows amidst the red-sandstone courtyards and royal
            heritage of {site.venue.name}, Bikaner.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9 }}
            className="flex items-center gap-4 py-1"
          >
            <div className="flex items-center gap-1.5 sm:gap-3 bg-white/60 border border-stone-warm/50 rounded-2xl px-5 py-2.5 shadow-sm">
              {countdownUnits.map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-1.5 sm:gap-3">
                  {i > 0 && <span className="text-sand-gold/60 font-semibold self-start mt-0.5">:</span>}
                  <div className="flex flex-col items-center min-w-[32px]">
                    <span className="font-display text-lg sm:text-xl font-bold text-clay-rose">{unit.value}</span>
                    <span className="text-[8px] uppercase tracking-widest text-stone-muted font-sans font-semibold">{unit.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <span className="h-6 w-px bg-sand-gold/40" />

            <p className="text-[10px] sm:text-xs font-serif italic text-stone-dark/70 tracking-wide max-w-[145px] text-left leading-normal">
              until our celebration begins
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
            className="w-full flex justify-center lg:justify-start"
          >
            <button
              onClick={onScrollToRsvp}
              className="cursor-pointer group flex items-center gap-2.5 px-8 py-4 rounded-full bg-clay-rose text-white text-xs uppercase tracking-[0.18em] font-sans font-semibold hover:bg-clay-dark transition-all duration-300 shadow-sm hover:shadow-md"
            >
              RSVP to Our Invitation
              <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>
          </motion.div>
        </div>

        {/* Right: the full venue photo (uncropped — whole palace visible) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex justify-center px-4 relative"
        >
          <div className="relative w-full max-w-[600px] p-2.5 sm:p-3 rounded-3xl bg-gradient-to-b from-sand-gold-light via-sand-gold to-clay-dark shadow-xl">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-cream-stone">
              <img
                src={heroImg}
                alt="Folk dancers performing before the red-sandstone palace at Gaj Kesri, Bikaner"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-clay-dark/25 to-transparent pointer-events-none" />
            </div>

            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-cream border border-sand-gold flex items-center justify-center shadow-md z-20">
              <span className="font-display text-xs text-sand-gold font-bold">{site.couple.initials}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom flourish */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        className="w-full flex items-center justify-center gap-4 text-[9px] sm:text-[10px] tracking-[0.25em] font-sans text-stone-muted uppercase pt-4"
      >
        <span className="h-px w-8 sm:w-16 bg-stone-warm" />
        <span className="text-sand-gold">❧ 𑁍 ☙</span>
        <span className="h-px w-8 sm:w-16 bg-stone-warm" />
      </motion.div>
    </section>
  );
}
