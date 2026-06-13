import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import facade1 from '../assets/images/facade1.jpg';
import facade2 from '../assets/images/facade2.jpg';
import pool1 from '../assets/images/pool1.jpg';
import experience3 from '../assets/images/experience3.jpg';
import puppet2 from '../assets/images/puppet2.jpg';

interface Slide {
  src: string;
  caption: string;
}

const slides: Slide[] = [
  { src: facade1, caption: 'The rose-sandstone palace at dusk' },
  { src: facade2, caption: 'A grand approach across sweeping lawns' },
  { src: pool1, caption: 'The poolside sandstone pavilion' },
  { src: experience3, caption: 'Ghoomar — Rajasthani folk dance' },
  { src: puppet2, caption: 'Kathputli puppetry in the lamplit courtyard' },
];

const AUTOPLAY_MS = 5000;

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay (re-arms on each change; pauses on hover/focus)
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, goTo]);

  // Touch swipe
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    touchX.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  };

  return (
    <section id="gallery" className="bg-cream py-24 px-4 sm:px-6 bg-jaali-gold">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="font-serif italic text-lg sm:text-xl text-clay-rose block mb-2">
            A Glimpse
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-dark uppercase tracking-tight">
            Glimpses of Gaj Kesri
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="h-px w-8 bg-sand-gold/60" />
            <span className="text-sand-gold text-lg">✦ 𑁍 ✦</span>
            <span className="h-px w-8 bg-sand-gold/60" />
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative group"
          role="region"
          aria-roledescription="carousel"
          aria-label="Photos of Gaj Kesri"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Sandstone frame */}
          <div className="rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-sand-gold-light via-sand-gold to-clay-dark shadow-xl">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-cream-stone">
              {slides.map((slide, i) => (
                <motion.figure
                  key={slide.src}
                  className="absolute inset-0 m-0"
                  initial={false}
                  animate={{ opacity: i === index ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  style={{ pointerEvents: i === index ? 'auto' : 'none' }}
                  aria-hidden={i !== index}
                >
                  <img
                    src={slide.src}
                    alt={slide.caption}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover object-center select-none"
                    draggable={false}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-clay-dark/80 to-transparent pointer-events-none" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                    <span className="font-serif italic text-lg sm:text-2xl drop-shadow-sm">
                      {slide.caption}
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="cursor-pointer absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-clay-dark shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="cursor-pointer absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-clay-dark shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2.5 mt-6">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === index}
              className={`cursor-pointer rounded-full transition-all duration-300 ${
                i === index
                  ? 'w-6 h-2 bg-clay-rose'
                  : 'w-2 h-2 bg-sand-gold/40 hover:bg-sand-gold'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
