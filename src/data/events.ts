import { WeddingEvent } from '../types';

export const weddingEvents: WeddingEvent[] = [
  {
    id: 'haldi',
    name: 'Haldi Ceremony',
    date: 'Wednesday, November 25, 2026',
    time: '12:00 PM - 3:00 PM',
    description: 'Bright flowers, poolside views, and friendly competition. Come for the phoolon ki haldi and games, stay for a relaxed lunch with the crew.',
    vibe: 'Sun-drenched, cheerful, and deeply traditional.'
  },
  {
    id: 'sangeet',
    name: 'Sangeet & Cocktail',
    date: 'Wednesday, November 25, 2026',
    time: '7:00 PM - Till you can dance',
    description: 'An evening of glam and high energy — dancing, music, cocktails, and one unforgettable party.',
    vibe: 'High-energy, melodic, and celebratory.'
  },
  {
    id: 'wedding',
    name: 'The Auspicious Wedding',
    date: 'Thursday, November 26, 2026',
    time: '12:00 PM - 5:00 PM',
    description: 'The big moment! The baraat rolls in at 12, jaimala at 1, and our pheras around the sacred fire from 2 to 4 — come watch us tie the knot.',
    vibe: 'Serene, celestial, and timelessly elegant.'
  },
  {
    id: 'friendshang',
    name: 'Post-Wedding Friends Hang',
    date: 'Thursday, November 26, 2026',
    time: '8:00 PM - Till conversations end',
    description: 'An intimate, warm bonfire night with friends featuring acoustic music, local food, and acoustic jams.',
    vibe: 'Cozy, nostalgic, and reserved for our close crew.',
    isFriendsOnly: true
  }
];
