import { motion } from 'motion/react';
import { Calendar, Clock, Sparkles, Music, Heart, Flame } from 'lucide-react';
import { weddingEvents } from '../data/events';

interface TimelineProps {
  isFriendsAuthorized: boolean;
}

export default function Timeline({ isFriendsAuthorized }: TimelineProps) {
  // Filter events: Event 4 (Post-Wedding Friends Hang) is friends-only.
  const visibleEvents = weddingEvents.filter(
    (event) => !event.isFriendsOnly || isFriendsAuthorized
  );

  // Helper to map event elements to appropriate elegant traditional Rajasthani iconography / colors
  const getEventIcon = (id: string) => {
    switch (id) {
      case 'haldi':
        return <Sparkles className="w-5 h-5 text-mandarin stroke-[1.5]" />; // Vibrant Marigold / Turmeric
      case 'sangeet':
        return <Music className="w-5 h-5 text-clay-rose stroke-[1.5]" />; // Terracotta evening beats
      case 'wedding':
        return <Heart className="w-5 h-5 text-clay-dark stroke-[1.5]" />; // Royal Crimson Wedding mandap
      case 'friendshang':
        return <Flame className="w-5 h-5 text-lake-blue stroke-[1.5]" />; // Mewar Indigo Lakeside bonfire
      default:
        return <Calendar className="w-5 h-5 text-stone-muted stroke-[1.5]" />;
    }
  };

  // Human-friendly Indian color palette suggestions for guest coordinate styling!
  const getEventOutfitGuide = (id: string) => {
    switch (id) {
      case 'haldi':
        return {
          title: 'Vibe & Attire Dresscode:',
          attire: 'Shades of the sun — marigold, turmeric yellow & warm orange',
          tip: 'Dress in bright, sunny hues to glow in the morning light — think marigold, saffron, and sunset orange.'
        };
      case 'sangeet':
        return {
          title: 'Vibe & Attire Dresscode:',
          attire: 'Red-carpet glam — your most dazzling cocktail or Indo-Western looks',
          tip: 'All glammed up, A-game on. Come camera-ready — a little red-carpet surprise awaits.'
        };
      case 'wedding':
        return {
          title: 'The Auspicious Vows Attire:',
          attire: 'Come as you please',
          tip: 'No set dress code for the ceremony — traditional Indian wear is always welcome, but wear whatever makes you feel your best.'
        };
      case 'friendshang':
        return {
          title: 'Bonfire Acoustic Attire:',
          attire: 'Casuals, comfy pajamas, relaxed vibes only',
          tip: 'Desert night winds can get quite chilly — bring something warm to cozy up in.'
        };
      default:
        return null;
    }
  };

  return (
    <section id="itinerary" className="py-24 px-4 max-w-5xl mx-auto bg-jaali-gold">
      
      {/* Editorial Sophisticated Header */}
      <div className="text-center mb-16 md:mb-24 relative">
        <span className="font-serif italic text-lg sm:text-xl text-clay-rose block mb-2">
          Subh Vivah Sanskar
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-stone-dark tracking-tight mb-4 uppercase">
          The Wedding Itinerary
        </h2>
        
        {/* Ornate Gold Mandira Flourish Divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="h-[1px] w-12 bg-sand-gold/60"></span>
          <span className="text-sand-gold text-lg">✦ 𑁍 ✦</span>
          <span className="h-[1px] w-12 bg-sand-gold/60"></span>
        </div>
        
        <p className="text-xs sm:text-sm font-sans font-light tracking-wide text-stone-muted max-w-md mx-auto leading-relaxed">
          A little bit of tradition, a lot of celebration, and all of our favorite people. Here's what we've got planned for the festivities.
        </p>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-sand-gold/30 ml-4 md:ml-32 md:pl-16 pl-8 space-y-16 py-4">
        {visibleEvents.map((event, index) => {
          const outfitGuide = getEventOutfitGuide(event.id);
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="relative group1 animate-gold-border pb-1"
            >
              {/* Timeline Marker Ring */}
              <div className="absolute -left-[41px] md:-left-[105px] top-1 flex items-center justify-center">
                {/* Horizontal line for desktop */}
                <div className="hidden md:block w-16 h-[1px] bg-sand-gold/30 mr-4 select-none"></div>
                
                {/* Round icon node */}
                <div className="w-10 h-10 rounded-full border border-sand-gold/50 bg-[#faf8f4] flex items-center justify-center shadow-sm group-hover:border-clay-rose transition-colors duration-500">
                  {getEventIcon(event.id)}
                </div>
              </div>

              {/* Event Details Card */}
              <div className="relative p-7 md:p-8 rounded-3xl border border-stone-warm bg-cream-stone/85 backdrop-blur-sm shadow-[0_4px_24px_rgba(43,40,35,0.02)] transition-all duration-500 hover:shadow-[0_8px_32px_rgba(190,83,60,0.06)] hover:border-clay-rose/50">
                
                {/* Private Badge */}
                {event.isFriendsOnly && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] tracking-widest uppercase bg-amber-50/70 text-sand-gold border border-sand-gold/30 font-sans font-semibold mb-4">
                    <Sparkles className="w-3 h-3 text-sand-gold shrink-0" />
                    Exclusive Friends Celebration
                  </div>
                )}

                {/* Card Title Details */}
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 mb-4 pb-4 border-b border-stone-warm/50">
                  <h3 className="font-serif text-2xl font-light text-stone-dark">
                    {event.name}
                  </h3>
                  
                  {/* Date/Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] md:text-xs font-sans text-stone-muted uppercase tracking-wider font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-clay-rose shrink-0" />
                      {event.date.split(',')[1] || event.date}
                    </span>
                    <span className="hidden sm:inline text-stone-warm">•</span>
                    <span className="flex items-center gap-1.5 text-stone-dark">
                      <Clock className="w-3.5 h-3.5 text-sand-gold shrink-0" />
                      {event.time}
                    </span>
                  </div>
                </div>

                {/* description */}
                <p className="text-xs sm:text-sm font-sans font-light text-stone-dark/95 leading-relaxed mb-6">
                  {event.description}
                </p>

                {/* Outfit & Attire Guide banner */}
                {outfitGuide && (
                  <div className="bg-orange-50/30 rounded-2xl p-4 border-l-2 border-clay-rose flex flex-col gap-1.5 bg-jaali-rose bg-[size:24px_24px]">
                    <div className="flex items-center gap-1 text-[9px] tracking-widest uppercase font-bold text-clay-rose">
                      <Sparkles className="w-3 h-3 text-clay-rose shrink-0" />
                      {outfitGuide.title}
                    </div>
                    <div className="text-xs font-medium text-stone-dark">
                      Dresscode: <span className="text-clay-rose font-semibold">{outfitGuide.attire}</span>
                    </div>
                    <div className="text-[11px] text-stone-muted italic leading-relaxed">
                      {outfitGuide.tip}
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
