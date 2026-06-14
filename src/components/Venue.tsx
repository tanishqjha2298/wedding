import { motion } from 'motion/react';
import {
  Plane,
  TrainFront,
  Car,
  BedDouble,
  ThermometerSun,
  MapPin,
  Info,
  ArrowUpRight,
} from 'lucide-react';
import { site } from '../config';
import venueImg from '../assets/images/gaj_kesari.webp';

const gettingThere = [
  {
    icon: Plane,
    title: 'By Air',
    body: 'Nal Airport, Bikaner (BKB) has very limited service — about one flight a day from Delhi — so be sure to book well in advance!',
  },
  {
    icon: TrainFront,
    title: 'By Train',
    body: 'Bikaner Junction is well connected to Delhi, Jaipur and Jodhpur — including overnight and the Bikaner–Delhi superfast services.',
  },
  {
    icon: Car,
    title: 'By Road',
    body: 'Roughly 5 hrs from Jodhpur, 6 hrs from Jaipur and 8–9 hrs from Delhi across the Thar. Tell us your plans — we can help arrange airport transfers.',
  },
];

// Google Maps search link (no API key needed)
const mapsUrl = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
// Google search link (good for trip-planning)
const searchUrl = (q: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(q)}`;

const explore = [
  { name: 'Junagarh Fort', desc: 'Unconquered carved courts', q: 'Junagarh Fort Bikaner' },
  { name: 'Rampuria Havelis', desc: 'Ornate red-sandstone facades', q: 'Rampuria Haveli Bikaner' },
  { name: 'Karni Mata Temple', desc: 'The famed temple of rats', q: 'Karni Mata Temple Deshnoke' },
  { name: 'Camel Desert Safari', desc: 'Golden dune sunset rides', q: 'Camel Safari Bikaner' },
  { name: 'Gajner Palace & Lake', desc: 'Wildlife desert oasis', q: 'Gajner Palace Bikaner' },
  { name: 'Devi Kund Sagar', desc: 'Royal cenotaph spires', q: 'Devi Kund Sagar Bikaner' },
];

// Nearby Rajasthan cities to extend the trip
const nearby = [
  { name: 'Jodhpur', desc: 'The Blue City · ~5 hrs', q: 'things to do in Jodhpur Rajasthan' },
  { name: 'Jaisalmer', desc: 'Golden City & dunes · ~6 hrs', q: 'things to do in Jaisalmer Rajasthan' },
  { name: 'Jaipur', desc: 'The Pink City · ~6 hrs', q: 'things to do in Jaipur Rajasthan' },
  { name: 'Udaipur', desc: 'City of Lakes · ~9 hrs', q: 'things to do in Udaipur Rajasthan' },
];

export default function Venue() {
  return (
    <section
      id="venue"
      className="bg-cream-stone py-24 px-4 sm:px-6 border-y border-stone-warm"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-serif italic text-lg sm:text-xl text-clay-rose block mb-2">
            Padharo Mhare Des
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-dark uppercase tracking-tight">
            Travel &amp; Stay
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="h-px w-8 bg-sand-gold/60" />
            <span className="text-sand-gold text-lg">✦ 𑁍 ✦</span>
            <span className="h-px w-8 bg-sand-gold/60" />
          </div>
        </div>

        {/* Feature photo of the real venue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-warm mb-12 md:mb-16"
        >
          <img
            src={venueImg}
            alt="Gaj Kesri, Bikaner — red-sandstone heritage palace"
            className="w-full h-[300px] sm:h-[420px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-clay-dark/85 via-clay-dark/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-sand-gold-light font-semibold mb-1.5">
              The Venue
            </p>
            <h3 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight">
              {site.venue.fullName}
            </h3>
            <p className="font-serif italic text-base sm:text-lg text-white/85 mt-1">
              {site.venue.addressLine}
            </p>
            <a
              href={site.venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-white/95 hover:bg-white text-clay-dark text-xs font-sans font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition-all shadow-md"
            >
              <MapPin className="w-3.5 h-3.5" />
              Open in Google Maps
            </a>
          </div>
        </motion.div>

        {/* Getting there */}
        <div className="grid sm:grid-cols-3 gap-5 md:gap-6 mb-10">
          {gettingThere.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="p-6 rounded-3xl border border-stone-warm bg-white shadow-sm"
            >
              <div className="w-12 h-12 rounded-full border border-sand-gold bg-cream flex items-center justify-center text-clay-rose shadow-inner mb-4">
                <card.icon className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-xl text-stone-dark mb-2">{card.title}</h4>
              <p className="text-xs sm:text-sm font-sans font-light text-stone-dark/85 leading-relaxed">
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stay + weather */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="p-6 md:p-8 rounded-3xl border border-stone-warm bg-white shadow-sm flex gap-5 items-start"
          >
            <div className="w-12 h-12 rounded-full border border-sand-gold bg-cream flex items-center justify-center shrink-0 text-clay-rose shadow-inner">
              <BedDouble className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h4 className="font-serif text-xl sm:text-2xl text-stone-dark">Where You'll Stay</h4>
              <p className="text-xs sm:text-sm font-sans font-light text-stone-dark/85 leading-relaxed">
                Every celebration unfolds within the sandstone walls of {site.venue.name},
                so we can all reside, dine and dance together. Rooms are hosted for the
                nights of <strong className="font-semibold text-stone-dark">Nov 25th &amp; 26th</strong>.
              </p>
              <div className="text-[10px] font-mono uppercase tracking-wider text-clay-rose font-bold inline-flex items-center gap-1 pt-1">
                <Info className="w-3.5 h-3.5" />
                Your room is pre-arranged for both nights
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="p-6 md:p-8 rounded-3xl border border-stone-warm bg-white shadow-sm flex gap-5 items-start"
          >
            <div className="w-12 h-12 rounded-full border border-sand-gold bg-cream flex items-center justify-center shrink-0 text-clay-rose shadow-inner">
              <ThermometerSun className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h4 className="font-serif text-xl sm:text-2xl text-stone-dark">Good to Know</h4>
              <p className="text-xs sm:text-sm font-sans font-light text-stone-dark/85 leading-relaxed">
                Late November in the Thar means warm, sunlit days (around 25&deg;C) and
                crisp desert nights (near 10&deg;C). Pack a shawl or jacket for the
                evening ceremonies — and comfortable shoes for the courtyards.
              </p>
              <div className="text-[10px] font-mono uppercase tracking-wider text-sand-gold font-bold inline-flex items-center gap-1 pt-1">
                <Info className="w-3.5 h-3.5" />
                Layers for chilly evenings recommended
              </div>
            </div>
          </motion.div>
        </div>

        {/* Explore Bikaner */}
        <div className="mb-10">
          <span className="text-[10px] tracking-widest uppercase font-bold text-mandarin block mb-3 font-sans text-center sm:text-left">
            ✧ While You're in Bikaner
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {explore.map((place) => (
              <a
                key={place.name}
                href={mapsUrl(place.q)}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 bg-white rounded-xl border border-stone-warm flex flex-col justify-between hover:border-clay-rose/40 hover:shadow-sm transition-all"
              >
                <span className="text-xs sm:text-sm font-semibold text-stone-dark flex items-center justify-between gap-1">
                  {place.name}
                  <ArrowUpRight className="w-3.5 h-3.5 text-sand-gold opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </span>
                <span className="text-[10px] sm:text-[11px] text-stone-muted italic mt-0.5">{place.desc}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Extend your trip in Rajasthan */}
        <div>
          <span className="text-[10px] tracking-widest uppercase font-bold text-mandarin block mb-3 font-sans text-center sm:text-left">
            ✧ Extend Your Trip in Rajasthan
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {nearby.map((city) => (
              <a
                key={city.name}
                href={searchUrl(city.q)}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 bg-white rounded-xl border border-stone-warm flex flex-col justify-between hover:border-clay-rose/40 hover:shadow-sm transition-all"
              >
                <span className="text-xs sm:text-sm font-semibold text-stone-dark flex items-center justify-between gap-1">
                  {city.name}
                  <ArrowUpRight className="w-3.5 h-3.5 text-sand-gold opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </span>
                <span className="text-[10px] sm:text-[11px] text-stone-muted italic mt-0.5">{city.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
