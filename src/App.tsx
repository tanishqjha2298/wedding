import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Gift } from 'lucide-react';
import { site } from './config';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import Venue from './components/Venue';
import Gallery from './components/Gallery';
import RsvpForm from './components/RsvpForm';
import AdminDashboard from './components/AdminDashboard';
import Gifts from './components/Gifts';
import Nav from './components/Nav';
import coupleImg from './assets/images/couple.jpg';
import proposalImg from './assets/images/proposal.jpg';

export default function App() {
  // Friends-only events are revealed via a private link (?invite=friends or ?crew=true),
  // then remembered for the browser session. Computed synchronously to avoid a flash.
  const [isFriendsAuthorized, setIsFriendsAuthorized] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const fromUrl =
      params.get('crew') === 'true' ||
      params.get('invite') === 'friends' ||
      path === '/friends' ||
      path === '/crew';
    try {
      return fromUrl || localStorage.getItem('friendsAuthorized') === 'true';
    } catch {
      return fromUrl;
    }
  });

  // The host RSVP console lives at #manage, hidden from regular guests.
  const [isManageView, setIsManageView] = useState(
    typeof window !== 'undefined' && window.location.hash === '#manage',
  );

  // The gifts & blessings page lives at /gifts (visible to everyone).
  const [isGiftsView, setIsGiftsView] = useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    return path === '/gifts' || window.location.hash === '#gifts';
  });

  // Audience-specific variants, detected from the URL:
  //  • /ladkiwale (bride's side)  → no Gifts & Blessings section at all
  //  • /ladkewale (groom's side)  → gifts page shown, but no wishlist (Shagun only)
  const side = (() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const q = new URLSearchParams(window.location.search).get('side');
    if (path === '/ladkiwale' || q === 'ladkiwale') return 'ladkiwale';
    if (path === '/ladkewale' || q === 'ladkewale') return 'ladkewale';
    return null;
  })();
  const hideGifts = side === 'ladkiwale';
  const hideWishlist = side === 'ladkewale';

  useEffect(() => {
    // Friends unlock via a clean path (/friends, /crew) or query (?invite=friends,
    // ?crew=true), then remembered for the rest of the browser session so a
    // refresh or in-page navigation won't lose it.
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const friendsFromUrl =
      params.get('crew') === 'true' ||
      params.get('invite') === 'friends' ||
      path === '/friends' ||
      path === '/crew';

    let remembered = false;
    try {
      // localStorage persists across tabs and full-page navigations (including
      // the in-app browsers used by WhatsApp/Instagram), so a friend who opens
      // the private link stays unlocked when they move between pages.
      if (friendsFromUrl) localStorage.setItem('friendsAuthorized', 'true');
      remembered = localStorage.getItem('friendsAuthorized') === 'true';
    } catch {
      // storage may be unavailable (private mode) — fall back to URL only
    }
    setIsFriendsAuthorized(friendsFromUrl || remembered);

    const onHashChange = () => {
      setIsManageView(window.location.hash === '#manage');
      setIsGiftsView(window.location.hash === '#gifts');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleScrollToRsvp = () => {
    document.getElementById('rsvp-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carry the active variant through full-page navigations via the URL itself,
  // so the mode survives even if storage is wiped (belt-and-suspenders).
  const giftsHref = hideWishlist
    ? '/gifts?side=ladkewale'
    : isFriendsAuthorized
      ? '/gifts?invite=friends'
      : '/gifts';

  // Keep variant guests on their link when they tap the logo / go back, so the
  // tailored view can't be lost via a bounce to the default invitation.
  const homeHref = side === 'ladkiwale' ? '/ladkiwale' : side === 'ladkewale' ? '/ladkewale' : '/';
  const giftsBackHref =
    side === 'ladkewale' ? '/ladkewale' : isFriendsAuthorized ? '/?invite=friends' : '/';

  // ── Gifts & Blessings (public) ──────────────────────────────────────────
  if (isGiftsView) {
    return (
      <Gifts
        isFriendsAuthorized={isFriendsAuthorized}
        hideWishlist={hideWishlist}
        backHref={giftsBackHref}
      />
    );
  }

  // ── Host console (private) ──────────────────────────────────────────────
  if (isManageView) {
    return (
      <div className="relative min-h-screen bg-cream text-stone-dark font-sans antialiased">
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <a
            href="#"
            onClick={() => setIsManageView(false)}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-stone-muted hover:text-clay-rose transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to invitation
          </a>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // ── Guest invitation ────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-cream text-stone-dark font-sans antialiased selection:bg-clay-rose selection:text-white">
      <Nav giftsHref={giftsHref} homeHref={homeHref} showGifts={!hideGifts} />

      <Hero onScrollToRsvp={handleScrollToRsvp} isFriendsAuthorized={isFriendsAuthorized} />

      {/* The couple — engagement photo paired with the verse */}
      <section className="py-20 md:py-24 px-6 border-y border-stone-warm bg-cream-stone bg-jaali-rose">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Engagement photo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex justify-center"
          >
            <div className={`relative w-full ${isFriendsAuthorized ? 'max-w-[460px]' : 'max-w-[420px]'} p-2.5 sm:p-3 rounded-3xl bg-gradient-to-b from-sand-gold-light via-sand-gold to-clay-dark shadow-xl`}>
              <div className={`relative ${isFriendsAuthorized ? 'aspect-[3/2]' : 'aspect-[3/4]'} overflow-hidden rounded-2xl bg-cream-stone`}>
                <img
                  src={isFriendsAuthorized ? coupleImg : proposalImg}
                  alt={`${site.couple.bride} & ${site.couple.groom}`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-cream border border-sand-gold flex items-center justify-center shadow-md z-20">
                <span className="font-display text-xs text-sand-gold font-bold">{site.couple.initials}</span>
              </div>
            </div>
          </motion.div>

          {/* Verse */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4 }}
            className="text-center md:text-left space-y-5"
          >
            <span className="text-clay-rose text-xl">❧ 𑁍 ☙</span>
            <p className="font-serif italic text-2xl md:text-3xl text-clay-dark leading-relaxed">
              From a rooftop in New York to a palace in Bikaner — come along for
              the best chapter yet.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3.5 text-stone-muted">
              <span className="h-px w-8 bg-stone-warm" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold">
                Our Forever Begins
              </span>
              <span className="h-px w-8 bg-stone-warm" />
            </div>
          </motion.div>
        </div>
      </section>

      <Timeline isFriendsAuthorized={isFriendsAuthorized} />

      <Venue />

      <Gallery />

      <RsvpForm isFriendsAuthorized={isFriendsAuthorized} />

      {/* Footer */}
      <footer className="bg-clay-dark text-cream py-20 px-6 text-center relative overflow-hidden bg-jaali-rose">
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sand-gold to-transparent" />
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <span className="text-sand-gold text-2xl block mb-2">𑁍</span>
          <div className="font-serif italic text-3xl sm:text-4xl text-white tracking-wide opacity-95">
            {site.couple.bride} &amp; {site.couple.groom}
          </div>

          {!hideGifts && (
            <a
              href={giftsHref}
              className="inline-flex items-center gap-2 bg-sand-gold/15 hover:bg-sand-gold/25 text-sand-gold-light border border-sand-gold/40 text-xs font-sans font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all"
            >
              <Gift className="w-4 h-4" />
              Gifts &amp; Blessings
            </a>
          )}

          <div className="w-16 h-px bg-sand-gold/40 mx-auto" />
          <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] uppercase text-sand-gold-light/80 leading-relaxed font-semibold">
            With Love • {site.venue.city} • {site.dateLabel}
          </p>
        </div>
      </footer>
    </div>
  );
}
