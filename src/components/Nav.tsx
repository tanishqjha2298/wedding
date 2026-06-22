import { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import { site } from '../config';

export default function Nav({
  giftsHref = '/gifts',
  homeHref = '/',
  showGifts = true,
}: {
  giftsHref?: string;
  homeHref?: string;
  showGifts?: boolean;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const anchorClass =
    'hidden sm:inline-block px-3 py-2 text-[11px] uppercase tracking-[0.12em] font-sans font-semibold text-stone-dark hover:text-clay-rose transition-colors';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <nav className="bg-cream/95 backdrop-blur-sm border-b border-stone-warm/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <a href={homeHref} className="font-display text-base font-bold text-clay-rose tracking-wide shrink-0">
            {site.couple.initials}
          </a>

          <div className="flex items-center gap-1 sm:gap-2">
            <a href="#itinerary" onClick={(e) => toSection(e, 'itinerary')} className={anchorClass}>Itinerary</a>
            <a href="#venue" onClick={(e) => toSection(e, 'venue')} className={anchorClass}>Travel</a>
            <a href="#rsvp-section" onClick={(e) => toSection(e, 'rsvp-section')} className={anchorClass}>RSVP</a>
            {showGifts && (
              <a
                href={giftsHref}
                className="inline-flex items-center gap-1.5 bg-clay-rose text-white text-[11px] uppercase tracking-[0.12em] font-sans font-bold px-4 py-2 rounded-full hover:bg-clay-dark transition-all shadow-sm shrink-0"
              >
                <Gift className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Gifts &amp; Blessings</span>
                <span className="sm:hidden">Gifts</span>
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
