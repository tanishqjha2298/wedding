/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Calendar, MapPin, Music, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { rajasthaniFolkSynth, FolkBeatType } from '../utils/music';
import rajasPalaceImg from '../assets/images/rajas_palace_1779739137510.png';

// Resolve image at compile-time to allow proper production asset bundling
const HERO_IMAGE_URL = rajasPalaceImg;

interface HeroProps {
  onScrollToRsvp: () => void;
}

export default function Hero({ onScrollToRsvp }: HeroProps) {
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [activeBeat, setActiveBeat] = useState<FolkBeatType>(rajasthaniFolkSynth.getBeatType());

  const handleBeatChange = (type: FolkBeatType) => {
    rajasthaniFolkSynth.setBeatType(type);
    setActiveBeat(type);
    if (!isAudioPlaying) {
      rajasthaniFolkSynth.start();
      setIsAudioPlaying(true);
    }
  };

  useEffect(() => {
    const target = new Date('2026-11-25T00:00:00+05:30').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days: d, hours: h, minutes: m });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sync music callback state
  useEffect(() => {
    rajasthaniFolkSynth.setCallback((step, note) => {
      setCurrentStep(step);
      setCurrentNote(note);
    });

    return () => {
      // Clean up player on unmount
      rajasthaniFolkSynth.stop();
    };
  }, []);

  const toggleMusic = () => {
    if (isAudioPlaying) {
      rajasthaniFolkSynth.stop();
      setIsAudioPlaying(false);
    } else {
      rajasthaniFolkSynth.start();
      setIsAudioPlaying(true);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 md:py-12 select-none overflow-hidden bg-[#faf8f4] bg-jaali-rose">
      
      {/* Decorative Traditional Corner Borders */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-sand-gold pointer-events-none opacity-60"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-sand-gold pointer-events-none opacity-60"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-sand-gold pointer-events-none opacity-60"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-sand-gold pointer-events-none opacity-60"></div>

      {/* SVG Clip Path definitions for our traditional Mihrab scalloped custom archway */}
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          {/* Custom vector path defining an elegant architectural scalloped dome window (Mihrab) */}
          <clipPath id="clip-mihrab" clipPathUnits="objectBoundingBox">
            <path d="M 0.5 0 
                     C 0.42 0.05, 0.38 0.08, 0.32 0.09 
                     C 0.23 0.11, 0.18 0.15, 0.12 0.20
                     C 0.06 0.25, 0.03 0.34, 0.01 0.42
                     C 0.00 0.50, 0.00 0.60, 0.00 1.00
                     L 1.00 1.00 
                     C 1.00 0.60, 1.00 0.50, 0.99 0.42
                     C 0.97 0.34, 0.94 0.25, 0.88 0.20
                     C 0.82 0.15, 0.77 0.11, 0.68 0.09
                     C 0.62 0.08, 0.58 0.05, 0.50 0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Top Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full flex flex-col md:flex-row items-center justify-between gap-4 z-20 max-w-6xl px-4 pt-2"
      >
        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.25em] text-clay-rose font-semibold font-sans">
          <Calendar className="w-4 h-4 text-clay-rose shrink-0" />
          Nov 25 &amp; 26, 2026
        </span>
        
        {/* Dynamic Shehnai Music Controller Ring with Presets */}
        <div className="flex flex-col sm:flex-row items-center gap-3 z-20 max-w-full">
          <motion.button
            onClick={toggleMusic}
            className={`cursor-pointer group flex items-center gap-2.5 px-4.5 py-2 rounded-full border shadow-sm transition-all duration-300 bg-white/95 text-stone-dark ${
              isAudioPlaying 
                ? 'border-clay-rose ring-1 ring-clay-rose/20 text-clay-rose font-semibold' 
                : 'border-stone-warm hover:border-sand-gold font-medium'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            <div className="relative flex items-center justify-center shrink-0">
              {isAudioPlaying ? (
                <>
                  <span className="absolute animate-ping inline-flex h-2 w-2 rounded-full bg-clay-rose opacity-40"></span>
                  <Volume2 className="w-3.5 h-3.5 text-clay-rose animate-bounce" />
                </>
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-stone-muted group-hover:text-sand-gold transition-colors" />
              )}
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.16em] font-sans">
              {isAudioPlaying ? 'Mute' : 'Play Celebration Beats'}
            </span>
          </motion.button>

          {/* Preset Beat Selection Tabs */}
          <div className="flex items-center gap-1 bg-stone-warm/30 p-1 rounded-full border border-stone-warm/50 backdrop-blur-sm shadow-inner shrink-0">
            {([
              { id: 'kesariya', label: '🌸 Balam Folk', tooltip: 'Mellow Folk Welcoming Tune' },
              { id: 'ghoomar', label: '💃 Ghoomar 3/4', tooltip: 'Upbeat Spinning Dance Beats' },
              { id: 'dhol', label: '🥁 Sangeet Dhol', tooltip: 'High-Energy Wedding Drums' }
            ] as const).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleBeatChange(preset.id)}
                className={`cursor-pointer text-[9px] sm:text-[10px] font-sans font-semibold px-2.5 py-1 rounded-full tracking-wide transition-all ${
                  activeBeat === preset.id
                    ? 'bg-clay-rose text-white shadow-sm'
                    : 'text-stone-muted hover:text-stone-dark hover:bg-white/40'
                }`}
                title={preset.tooltip}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <a 
          href="https://www.google.com/search?q=gaj+kesari+bikaner&sca_esv=3b28bf167f96f335&sxsrf=ANbL-n60jbxh_6DSboed2tLKTaAeatyqbw%3A1779738993202&ei=cakUaqLXC4TWptQPnpnHgQc&biw=1710&bih=951&ved=0ahUKEwji0-2znNWUAxUEq4kEHZ7MMXAQ4dUDCBA&uact=5&oq=gaj+kesari+bikaner&gs_lp=Egxnd3Mtd2l6LXNlcnAiEmdhaiBrZXNhcmkgYmlrYW5lcjIREC4YrwEYxwEYgAQYmAUYmQUyCBAAGBYYHhgKMggQABgWGB4YCjIIEAAYFhgeGAoyBhAAGBYYHjIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjIGEAAYFhgeMgYQABgWGB4yIBAuGK8BGMcBGIAEGJgFGJkFGJcFGNwEGN4EGOAE2AEBSKsyUKwKWKUxcAR4AZABAJgBywGgAdYTqgEGMy4xNy4xuAEDyAEA-AEBmAIZoALcFMICChAAGEcY1gQYsAPCAgsQABiABBiKBRiRAsICFhAuGIAEGIoFGEMYsQMYgwEYxwEY0QPCAg0QABiABBiKBRhDGLEDwgILEAAYgAQYsQMYgwHCAhAQABiABBiKBRhDGLEDGIMBwgIIEAAYgAQYsQPCAgoQABiABBiKBRhDwgIEEAAYA8ICERAuGIAEGLEDGIMBGMcBGNEDwgIFEAAYgATCAgoQLhiABBiKBRhDwgIKEC4YQxiABBiKBcICFRAuGAoYCxiDARjHARixAxjRAxiABMICDBAAGIAEGAoYCxixA8ICBRAuGIAEwgIJEC4YgAQYChgLwgIJEAAYgAQYChgLwgIJEC4YChgLGIAEwgILEC4YkQIYgAQYigXCAhEQLhiABBjHARivARiYBRiZBcICGhAuGJECGIAEGIoFGJcFGNwEGN4EGN8E2AEBwgIUEC4YgAQYlwUY3AQY3gQY4ATYAQGYAwCIBgGQBgi6BgYIARABGBSSBwY2LjE4LjGgB67yAbIHBjIuMTguMbgHyBTCBwgwLjYuMTguMcgHY4AIAQ&sclient=gws-wiz-serp" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.25em] text-sand-gold font-semibold font-sans hover:text-clay-rose transition-colors"
          title="Gaj Kesari, Bikaner (View Venue)"
        >
          <MapPin className="w-4 h-4 text-sand-gold shrink-0 animate-pulse" />
          Gaj Kesari, Bikaner
        </a>
      </motion.div>

      {/* Main Grid Content Area representing the Palace imagery and the Royal Invitation in balance */}
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 md:gap-12 items-center my-auto py-6 z-10">
        
        {/* Left Side: Editorial Typography & Beautiful Card Ornament (Column 1-7) */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8 px-4">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50/70 border border-[#e76f51]/15 text-[#e76f51] text-[10px] md:text-xs font-sans tracking-widest uppercase font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Traditional Royal Rajasthan Wedding
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.2 }}
            className="font-serif italic text-lg sm:text-2xl text-stone-muted tracking-wide"
          >
            Welcome to the Beginning of Our Forever
          </motion.p>

          {/* Big Elegant Titles using Font-Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center lg:items-start w-full"
          >
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight text-stone-dark leading-none">
              Muskaan
            </h1>
            
            <div className="relative w-full py-4 flex items-center justify-center lg:justify-start">
              <span className="absolute h-[1px] w-48 bg-stone-warm"></span>
              <span className="font-serif italic text-2xl md:text-3xl bg-[#faf8f4] z-10 px-6 text-clay-rose font-medium">&amp;</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight text-stone-dark leading-none">
              Tanishq
            </h1>
          </motion.div>

          {/* Short Editorial Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="text-xs sm:text-sm font-sans font-light tracking-wide text-stone-dark/85 max-w-md leading-relaxed"
          >
            With joyful hearts, we request the honor of your presence as we celebrate our love and exchange our vows amidst the historic clay palaces, red-sandstone courtyards, and grand heritage of Gaj Kesari in Bikaner.
          </motion.p>

          {/* Subtle Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9 }}
            className="flex items-center gap-4 py-1 text-stone-dark"
          >
            <div className="flex items-center gap-1.5 sm:gap-3 bg-white/60 hover:bg-white/95 border border-stone-warm/50 rounded-2xl px-5 py-2.5 shadow-[0_4px_16px_rgba(190,83,60,0.02)] transition-all">
              <div className="flex flex-col items-center min-w-[32px]">
                <span className="font-display text-lg sm:text-xl font-bold text-clay-rose">{timeLeft.days}</span>
                <span className="text-[8px] uppercase tracking-widest text-stone-muted font-sans font-semibold">days</span>
              </div>
              <span className="text-sand-gold/60 font-semibold self-start mt-0.5">:</span>
              <div className="flex flex-col items-center min-w-[32px]">
                <span className="font-display text-lg sm:text-xl font-bold text-clay-rose">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-stone-muted font-sans font-semibold">hrs</span>
              </div>
              <span className="text-sand-gold/60 font-semibold self-start mt-0.5">:</span>
              <div className="flex flex-col items-center min-w-[32px]">
                <span className="font-display text-lg sm:text-xl font-bold text-clay-rose">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-stone-muted font-sans font-semibold">mins</span>
              </div>
            </div>
            
            <span className="h-6 w-[1px] bg-sand-gold/40"></span>
            
            <p className="text-[10px] sm:text-xs font-serif italic text-stone-dark/70 tracking-wide max-w-[145px] text-left leading-normal">
              until our royal celebration begins
            </p>
          </motion.div>

          {/* CTA & Active Synthesizer Note Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start"
          >
            <button
              onClick={onScrollToRsvp}
              className="cursor-pointer group flex items-center gap-2.5 px-8 py-4 rounded-full bg-clay-rose text-white text-xs uppercase tracking-[0.18em] font-sans font-semibold hover:bg-clay-dark transition-all duration-300 shadow-sm hover:shadow-md"
            >
              RSVP Online Invitation
              <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>

            {/* Simulated Live Shehnai feedback visualizer */}
            <AnimatePresence>
              {isAudioPlaying && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-[#be533c]/10 text-clay-rose px-4 py-2 border border-[#be533c]/20 rounded-xl font-mono text-[10px]"
                >
                  <Music className="w-3.5 h-3.5 animate-spin" />
                  <span>Beat {currentStep + 1} / Note {currentNote || 'S'}</span>
                  <div className="flex gap-0.5 items-end h-3 w-4">
                    <span className="w-0.5 bg-clay-rose" style={{ height: (currentStep % 4) * 3 + 3 + 'px' }}></span>
                    <span className="w-0.5 bg-clay-rose" style={{ height: (currentStep % 3) * 4 + 2 + 'px' }}></span>
                    <span className="w-0.5 bg-clay-rose" style={{ height: (currentStep % 2) * 5 + 1 + 'px' }}></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

        {/* Right Side: The Gorgeous Palace Archway Window (Column 8-12) */}
        {/* Replicates the majestic scalloped stone arch window looking over the palace! */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center px-4 relative"
        >
          {/* Inner Golden Sandstone Arch Frame */}
          <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[4/5] p-3 sm:p-4 rounded-3xl bg-gradient-to-b from-[#e6cb95] via-[#c99342] to-[#6e2c1e] shadow-xl">
            
            {/* The Scalloped Arch window container inside */}
            <div className="relative w-full h-full bg-[#fbfaf5] overflow-hidden clip-mihrab-arch">
              {/* Actual Palace generated Image */}
              <img 
                src={HERO_IMAGE_URL} 
                alt="Rajasthani Palace Wedding Venue" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-bottom transition-all duration-1000 transform hover:scale-105"
              />
              
              {/* Rich Terracotta Clay Soft Vignette overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-clay-dark/30 to-transparent pointer-events-none"></div>
            </div>

            {/* Interactive Arch Floating Emblem */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#faf8f4] border border-sand-gold flex items-center justify-center shadow-md animate-bounce z-20">
              <span className="font-display text-xs text-sand-gold font-bold">M&amp;T</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Decorative elegant bottom margin details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        className="w-full flex items-center justify-center gap-4 text-[9px] sm:text-[10px] tracking-[0.25em] font-sans text-stone-muted uppercase pt-4"
      >
        <span className="h-[0.5px] w-8 sm:w-16 bg-stone-warm"></span>
        <a 
          href="https://www.google.com/search?q=gaj+kesari+bikaner&sca_esv=3b28bf167f96f335&sxsrf=ANbL-n60jbxh_6DSboed2tLKTaAeatyqbw%3A1779738993202&ei=cakUaqLXC4TWptQPnpnHgQc&biw=1710&bih=951&ved=0ahUKEwji0-2znNWUAxUEq4kEHZ7MMXAQ4dUDCBA&uact=5&oq=gaj+kesari+bikaner&gs_lp=Egxnd3Mtd2l6LXNlcnAiEmdhaiBrZXNhcmkgYmlrYW5lcjIREC4YrwEYxwEYgAQYmAUYmQUyCBAAGBYYHhgKMggQABgWGB4YCjIIEAAYFhgeGAoyBhAAGBYYHjIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjIGEAAYFhgeMgYQABgWGB4yIBAuGK8BGMcBGIAEGJgFGJkFGJcFGNwEGN4EGOAE2AEBSKsyUKwKWKUxcAR4AZABAJgBywGgAdYTqgEGMy4xNy4xuAEDyAEA-AEBmAIZoALcFMICChAAGEcY1gQYsAPCAgsQABiABBiKBRiRAsICFhAuGIAEGIoFGEMYsQMYgwEYxwEY0QPCAg0QABiABBiKBRhDGLEDwgILEAAYgAQYsQMYgwHCAhAQABiABBiKBRhDGLEDGIMBwgIIEAAYgAQYsQPCAgoQABiABBiKBRhDwgIEEAAYA8ICERAuGIAEGLEDGIMBGMcBGNEDwgIFEAAYgATCAgoQLhiABBiKBRhDwgIKEC4YQxiABBiKBcICFRAuGAoYCxiDARjHARixAxjRAxiABMICDBAAGIAEGAoYCxixA8ICBRAuGIAEwgIJEC4YgAQYChgLwgIJEAAYgAQYChgLwgIJEC4YChgLGIAEwgILEC4YkQIYgAQYigXCAhEQLhiABBjHARivARiYBRiZBcICGhAuGJECGIAEGIoFGJcFGNwEGN4EGN8E2AEBwgIUEC4YgAQYlwUY3AQY3gQY4ATYAQGYAwCIBgGQBgi6BgYIARABGBSSBwY2LjE4LjGgB67yAbIHBjIuMTguMbgHyBTCBwgwLjYuMTguMcgHY4AIAQ&sclient=gws-wiz-serp" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:underline hover:text-clay-rose transition-colors font-sans"
        >
          A Fairytale of Gaj Kesari Bikaner ↗
        </a>
        <span className="h-[0.5px] w-8 sm:w-16 bg-stone-warm"></span>
      </motion.div>
    </section>
  );
}
