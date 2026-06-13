import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { site } from './config';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import Venue from './components/Venue';
import Gallery from './components/Gallery';
import RsvpForm from './components/RsvpForm';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Friends-only events are revealed via a private link (?invite=friends or ?crew=true).
  const [isFriendsAuthorized, setIsFriendsAuthorized] = useState(false);

  // The host RSVP console lives at #manage, hidden from regular guests.
  const [isManageView, setIsManageView] = useState(
    typeof window !== 'undefined' && window.location.hash === '#manage',
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsFriendsAuthorized(
      params.get('crew') === 'true' || params.get('invite') === 'friends',
    );

    const onHashChange = () => setIsManageView(window.location.hash === '#manage');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleScrollToRsvp = () => {
    document.getElementById('rsvp-section')?.scrollIntoView({ behavior: 'smooth' });
  };

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
      <Hero onScrollToRsvp={handleScrollToRsvp} />

      {/* Verse divider */}
      <section className="py-24 text-center px-6 border-y border-stone-warm bg-cream-stone bg-jaali-rose">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4 }}
          className="max-w-xl mx-auto space-y-5"
        >
          <span className="text-clay-rose text-xl">❧ 𑁍 ☙</span>
          <p className="font-serif italic text-2xl md:text-3xl text-clay-dark leading-relaxed">
            "To love is to see ourselves in another's eyes, and to weave a bond
            as timeless as the golden sands of Bikaner."
          </p>
          <div className="flex items-center justify-center gap-3.5 text-stone-muted">
            <span className="h-px w-8 bg-stone-warm" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold">
              Our Forever Begins
            </span>
            <span className="h-px w-8 bg-stone-warm" />
          </div>
        </motion.div>
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
          <div className="w-16 h-px bg-sand-gold/40 mx-auto" />
          <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] uppercase text-sand-gold-light/80 leading-relaxed font-semibold">
            With Love • {site.venue.city} • {site.dateLabel}
          </p>
        </div>
      </footer>
    </div>
  );
}
