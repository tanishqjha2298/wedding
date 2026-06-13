/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeddingEvent } from '../types';

export const weddingEvents: WeddingEvent[] = [
  {
    id: 'haldi',
    name: 'Haldi Ceremony',
    date: 'Wednesday, November 25, 2026',
    time: '12:00 PM - 3:00 PM',
    description: 'A vibrant and affectionate ceremony and lunch filled with laughter, turmeric, and ancient blessings.',
    vibe: 'Sun-drenched, cheerful, and deeply traditional.'
  },
  {
    id: 'sangeet',
    name: 'Sangeet & Cocktail',
    date: 'Wednesday, November 25, 2026',
    time: '7:00 PM - Till you can dance',
    description: 'An evening of spirited musical performances, stellar dance moves, and a celebratory dinner.',
    vibe: 'High-energy, melodic, and celebratory.'
  },
  {
    id: 'wedding',
    name: 'The Auspicious Wedding',
    date: 'Thursday, November 26, 2026',
    time: '12:00 PM - 5:00 PM',
    description: 'The main traditional ceremony followed by high tea, marking the start of our eternal bond.',
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
