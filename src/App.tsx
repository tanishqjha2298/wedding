/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, MapPin, Calendar, Compass, Info, Wine, ThumbsUp } from 'lucide-react';
import { RsvpFormState } from './types';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import RsvpForm from './components/RsvpForm';
import AdminDashboard from './components/AdminDashboard';
import jharokhaLakeImg from './assets/images/jharokha_lake_1779739155204.png';

export default function App() {
  const [isFriendsAuthorized, setIsFriendsAuthorized] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<RsvpFormState[]>([]);
  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(true);

  // Read URL search parameters on load
  useEffect(() => {
    const parseUrlParameters = () => {
      const params = new URLSearchParams(window.location.search);
      const isCrew = params.get('crew') === 'true';
      const isFriends = params.get('invite') === 'friends';
      setIsFriendsAuthorized(isCrew || isFriends);
    };

    parseUrlParameters();

    // Listen for state changes if the URL gets updated programmatically
    window.addEventListener('popstate', parseUrlParameters);
    return () => window.removeEventListener('popstate', parseUrlParameters);
  }, []);

  const handleScrollToRsvp = () => {
    const element = document.getElementById('rsvp-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRsvpSubmit = (data: RsvpFormState) => {
    // Save to our react state array (this represents Appwrite collections later!)
    setSubmissions((prev) => [data, ...prev]);
    console.log('New RSVP received:', data);
  };

  // Simulate updating URL queries for simple review inside the iframe
  const toggleSimulation = () => {
    const nextAuth = !isFriendsAuthorized;
    setIsFriendsAuthorized(nextAuth);
    
    // Smoothly update URL query parameters in browser history
    const url = new URL(window.location.href);
    if (nextAuth) {
      url.searchParams.set('invite', 'friends');
    } else {
      url.searchParams.delete('invite');
      url.searchParams.delete('crew');
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="relative min-h-screen bg-[#faf8f4] text-stone-dark font-sans antialiased selection:bg-clay-rose selection:text-white">
      
      {/* Dynamic Demo Testing/Simulation Overlay Banner */}
      {showDemoBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-clay-dark text-[#fbfaf7] text-xs py-3 px-4 shadow-md sticky top-0 z-50 flex items-center justify-between gap-3 font-sans border-b border-white/10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 leading-relaxed">
            <span className="flex items-center gap-1 font-semibold text-sand-gold-light uppercase tracking-[0.12em]">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic RSVP Simulation:
            </span>
            <span className="font-light text-white/85">
              Event 4 is reserved for our close crew. Update query to <code className="bg-white/15 px-1.5 py-0.5 rounded font-mono text-[11px]">?invite=friends</code> or toggle here.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleSimulation}
              className="cursor-pointer bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold tracking-wide uppercase px-3 py-1.5 rounded-lg border border-white/20 transition-all"
            >
              Simulate: {isFriendsAuthorized ? 'Friends Verified ✔' : 'Standard Guest'}
            </button>
            <button 
              onClick={() => setShowDemoBanner(false)}
              className="cursor-pointer text-white/50 hover:text-white pb-0.5 text-sm font-semibold p-1"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Invitation Display Section */}
      <Hero onScrollToRsvp={handleScrollToRsvp} />

      {/* Aesthetic Spacer Verse - Rajasthani Royal Poetry framing */}
      <section className="py-24 text-center px-6 border-y border-stone-warm bg-cream-stone bg-jaali-rose bg-[size:36px_36px]">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4 }}
          className="max-w-xl mx-auto space-y-5"
        >
          {/* Traditional motif divider */}
          <span className="text-clay-rose text-xl">❧ 𑁍 ☙</span>
          
          <p className="font-serif italic text-2xl md:text-3xl text-clay-dark leading-relaxed">
            "To love is to see ourselves in another's eyes, and to weave a bond as timeless as the golden sands of Bikaner."
          </p>
          <div className="flex items-center justify-center gap-3.5 text-stone-muted">
            <span className="h-[0.5px] w-8 bg-stone-warm"></span>
            <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold">Our Dedicated Bond</span>
            <span className="h-[0.5px] w-8 bg-stone-warm"></span>
          </div>
        </motion.div>
      </section>

      {/* Structured Chronological Event Lineup */}
      <Timeline isFriendsAuthorized={isFriendsAuthorized} />

      {/* Beautiful Travel Details & Logistics Grid Section */}
      {/* Inspired by Image 2 - featuring Jharokha Lake overlook of Lake Pichola */}
      <section className="bg-cream-stone py-24 px-4 sm:px-6 border-y border-stone-warm relative">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16 md:mb-20">
            <span className="font-serif italic text-lg sm:text-xl text-clay-rose block mb-2">Location &amp; Sightseeing</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-dark uppercase tracking-tight">The Fairytale Setting</h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="h-[1px] w-8 bg-sand-gold/60"></span>
              <a 
                href="https://www.google.com/search?q=gaj+kesari+bikaner&sca_esv=3b28bf167f96f335&sxsrf=ANbL-n60jbxh_6DSboed2tLKTaAeatyqbw%3A1779738993202&ei=cakUaqLXC4TWptQPnpnHgQc&biw=1710&bih=951&ved=0ahUKEwji0-2znNWUAxUEq4kEHZ7MMXAQ4dUDCBA&uact=5&oq=gaj+kesari+bikaner&gs_lp=Egxnd3Mtd2l6LXNlcnAiEmdhaiBrZXNhcmkgYmlrYW5lcjIREC4YrwEYxwEYgAQYmAUYmQUyCBAAGBYYHhgKMggQABgWGB4YCjIIEAAYFhgeGAoyBhAAGBYYHjIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjIGEAAYFhgeMgYQABgWGB4yIBAuGK8BGMcBGIAEGJgFGJkFGJcFGNwEGN4EGOAE2AEBSKsyUKwKWKUxcAR4AZABAJgBywGgAdYTqgEGMy4xNy4xuAEDyAEA-AEBmAIZoALcFMICChAAGEcY1gQYsAPCAgsQABiABBiKBRiRAsICFhAuGIAEGIoFGEMYsQMYgwEYxwEY0QPCAg0QABiABBiKBRhDGLEDwgILEAAYgAQYsQMYgwHCAhAQABiABBiKBRhDGLEDGIMBwgIIEAAYgAQYsQPCAgoQABiABBiKBRhDwgIEEAAYA8ICERAuGIAEGLEDGIMBGMcBGNEDwgIFEAAYgATCAgoQLhiABBiKBRhDwgIKEC4YQxiABBiKBcICFRAuGAoYCxiDARjHARixAxjRAxiABMICDBAAGIAEGAoYCxixA8ICBRAuGIAEwgIJEC4YgAQYChgLwgIJEAAYgAQYChgLwgIJEC4YChgLGIAEwgILEC4YkQIYgAQYigXCAhEQLhiABBjHARivARiYBRiZBcICGhAuGJECGIAEGIoFGJcFGNwEGN4EGN8E2AEBwgIUEC4YgAQYlwUY3AQY3gQY4ATYAQGYAwCIBgGQBgi6BgYIARABGBSSBwY2LjE4LjGgB67yAbIHBjIuMTguMbgHyBTCBwgwLjYuMTguMcgHY4AIAQ&sclient=gws-wiz-serp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sand-gold text-sm font-bold uppercase tracking-widest hover:text-clay-rose hover:underline transition-all flex items-center gap-1.5"
                title="Google Search - Gaj Kesari Bikaner"
              >
                ✦ Gaj Kesari, Bikaner ↗ ✦
              </a>
              <span className="h-[1px] w-8 bg-sand-gold/60"></span>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Stunning Sandstone Arch Window framing our lake image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-[325px] sm:max-w-[340px] aspect-[3/4] p-3 rounded-t-[140px] rounded-b-3xl bg-gradient-to-b from-sand-gold-light via-sand-gold to-clay-dark shadow-xl hover:shadow-2xl transition-shadow duration-500">
                <div className="relative w-full h-full bg-[#faf8f4] overflow-hidden rounded-t-[130px] rounded-b-2xl">
                  {/* Generated Lake Overlook Image */}
                  <img 
                    src={jharokhaLakeImg} 
                    alt="Gaj Kesari Bikaner Jharokha View" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform scale-102 hover:scale-105 transition-transform duration-[1.5s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-clay-dark/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Travel, Lodging, and Explore Guides */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8">
              
              {/* Arriving card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="p-6 md:p-8 rounded-3xl border border-stone-warm bg-white shadow-sm flex gap-4 md:gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-full border border-sand-gold bg-[#faf8f4] flex items-center justify-center shrink-0 text-clay-rose shadow-inner">
                  <Compass className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-stone-dark">Arriving in Bikaner</h3>
                  <p className="text-xs sm:text-sm font-sans font-light text-stone-dark/85 leading-relaxed">
                    Bikaner, located in the traditional heart of the Thar Desert, is globally renowned for its red sandstone palaces, Havelis, and spicy savory treats. Nal Airport Bikaner (BKB) provides direct flights from Delhi, while larger airports Jodhpur and Jaipur offer beautiful road and trail scenery blocks.
                  </p>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-sand-gold font-bold inline-flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Our dynamic travel desk can streamline Jodhpur airport pickups
                  </div>
                </div>
              </motion.div>

              {/* Lodging Card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="p-6 md:p-8 rounded-3xl border border-stone-warm bg-white shadow-sm flex gap-4 md:gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-full border border-sand-gold bg-[#faf8f4] flex items-center justify-center shrink-0 text-clay-rose shadow-inner">
                  <Wine className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-stone-dark">
                    <a 
                      href="https://www.google.com/search?q=gaj+kesari+bikaner&sca_esv=3b28bf167f96f335&sxsrf=ANbL-n60jbxh_6DSboed2tLKTaAeatyqbw%3A1779738993202&ei=cakUaqLXC4TWptQPnpnHgQc&biw=1710&bih=951&ved=0ahUKEwji0-2znNWUAxUEq4kEHZ7MMXAQ4dUDCBA&uact=5&oq=gaj+kesari+bikaner&gs_lp=Egxnd3Mtd2l6LXNlcnAiEmdhaiBrZXNhcmkgYmlrYW5lcjIREC4YrwEYxwEYgAQYmAUYmQUyCBAAGBYYHhgKMggQABgWGB4YCjIIEAAYFhgeGAoyBhAAGBYYHjIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjIGEAAYFhgeMgYQABgWGB4yIBAuGK8BGMcBGIAEGJgFGJkFGJcFGNwEGN4EGOAE2AEBSKsyUKwKWKUxcAR4AZABAJgBywGgAdYTqgEGMy4xNy4xuAEDyAEA-AEBmAIZoALcFMICChAAGEcY1gQYsAPCAgsQABiABBiKBRiRAsICFhAuGIAEGIoFGEMYsQMYgwEYxwEY0QPCAg0QABiABBiKBRhDGLEDwgILEAAYgAQYsQMYgwHCAhAQABiABBiKBRhDGLEDGIMBwgIIEAAYgAQYsQPCAgoQABiABBiKBRhDwgIEEAAYA8ICERAuGIAEGLEDGIMBGMcBGNEDwgIFEAAYgATCAgoQLhiABBiKBRhDwgIKEC4YQxiABBiKBcICFRAuGAoYCxiDARjHARixAxjRAxiABMICDBAAGIAEGAoYCxixA8ICBRAuGIAEwgIJEC4YgAQYChgLwgIJEAAYgAQYChgLwgIJEC4YChgLGIAEwgILEC4YkQIYgAQYigXCAhEQLhiABBjHARivARiYBRiZBcICGhAuGJECGIAEGIoFGJcFGNwEGN4EGN8E2AEBwgIUEC4YgAQYlwUY3AQY3gQY4ATYAQGYAwCIBgGQBgi6BgYIARABGBSSBwY2LjE4LjGgB67yAbIHBjIuMTguMbgHyBTCBwgwLjYuMTguMcgHY4AIAQ&sclient=gws-wiz-serp" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-sand-gold hover:underline transition-colors"
                      title="View Gaj Kesari Bikaner Venue Details"
                    >
                      Heritage Hotel Gaj Kesari ↗
                    </a>
                  </h3>
                  <p className="text-xs sm:text-sm font-sans font-light text-stone-dark/85 leading-relaxed">
                    Our entire fairytale wedding celebration takes place inside the red-sandstone walls and designer art collection spaces of Gaj Kesari. Your stay is fully booked and hosted for the nights of Nov 25th and Nov 26th so we can all reside, dine, and dance in unified luxury.
                  </p>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-clay-rose font-bold inline-flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Your room reservations are pre-arranged for both check-in nights
                  </div>
                </div>
              </motion.div>

              {/* Local Sightseeing Grid */}
              <div className="pt-2">
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#e76f51] block mb-3 font-sans">
                  ✧ Must-Explore Bikaner Hotspots:
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {[
                    { name: 'Junagarh Fort', desc: 'Symmetrical Carved Courts' },
                    { name: 'Rampuria Havelis', desc: 'Ornate Sandstone Facades' },
                    { name: 'Devi Kund Sagar', desc: 'Royal Cenotaph Spires' },
                    { name: 'Gajner Palace & Lake', desc: 'Wildlife Desert Oasis' },
                    { name: 'Camel Research Walks', desc: 'Golden Dune Safaris' },
                    { name: 'Bhujia Bazaar Market', desc: 'World-Famed Savories' }
                  ].map((place, i) => (
                    <div key={i} className="p-3 bg-stone-warm/30 rounded-xl border border-stone-warm/60 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-stone-dark">{place.name}</span>
                      <span className="text-[10px] text-stone-muted italic mt-0.5">{place.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Intelligent Multi-Step RSVP Form Widget */}
      <RsvpForm 
        isFriendsAuthorized={isFriendsAuthorized} 
        onSubmitMock={handleRsvpSubmit} 
      />

      {/* Real-time RSVP Registry Administration Dashboard */}
      <AdminDashboard />

      {/* Editorial Sophisticated Footer */}
      <footer className="bg-clay-dark text-[#fbfaf7] py-20 px-6 text-center relative overflow-hidden bg-jaali-rose bg-[size:40px_40px]">
        {/* Delicate golden bottom separator */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sand-gold to-transparent"></div>
        
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <span className="text-sand-gold text-2xl block mb-2">𑁍</span>
          
          <div className="font-serif italic text-3xl sm:text-4xl font-normal text-white tracking-wide opacity-95">
            Muskaan &amp; Tanishq
          </div>
          
          <div className="w-16 h-[0.5px] bg-sand-gold/40 mx-auto"></div>
          
          <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] uppercase text-sand-gold-light/80 leading-relaxed font-semibold">
            With Love • Bikaner, Rajasthan, India • November 2026
          </p>
          
          <p className="text-[9px] font-mono text-white/35">
            © 2026 Muskaan &amp; Tanishq Wedding Celebrations • Created with Love
          </p>
        </div>
      </footer>
    </div>
  );
}
