/**
 * Single source of truth for editable site content.
 * Tweak names, dates, venue and links here — everything else reads from this.
 */

import skylightImg from './assets/images/gifts/skylight-calendar-15.webp';
import brevilleImg from './assets/images/gifts/breville-barista-express.webp';
import hatchImg from './assets/images/gifts/hatch-restore-3.webp';
import awayImg from './assets/images/gifts/away-featherlight-backpack-large.webp';
import smartFrameImg from './assets/images/gifts/smart-photo-frame.webp';
import mokobaraImg from './assets/images/gifts/mokobara-em-cabin-pro.webp';

export const site = {
  couple: {
    bride: 'Muskaan',
    groom: 'Tanishq',
    initials: 'M&T',
    // Formal parentage — shown to family/guests, hidden on the ?invite=friends link.
    brideParentage: 'Daughter of Prem & Ruchika Chugh',
    groomParentage: 'Son of Naveen & Sapna Jha',
  },

  // Used by the live countdown. ISO 8601 with India Standard Time offset.
  weddingStartISO: '2026-11-25T11:00:00+05:30',
  dateLabel: 'November 25 & 26, 2026',
  dateShort: 'Nov 25 & 26, 2026',

  rsvpDeadline: 'October 1st, 2026',

  venue: {
    name: 'Gaj Kesri',
    fullName: 'Brij Gaj Kesri, A Boutique Luxury Palace',
    addressLine: 'Bypass Road, Bikaner, Rajasthan 334001, India',
    city: 'Bikaner, Rajasthan, India',
    // Opens Google Maps to the venue (no API key needed).
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Brij%20Gaj%20Kesri%20Bikaner',
  },
} as const;

// ── Gifts & Blessings page ──────────────────────────────────────────────────
// Edit your gift registry and honeymoon-fund payment handles here.

export type RegistryIcon = 'calendar' | 'coffee' | 'alarm' | 'backpack' | 'luggage' | 'frame' | 'gift';

export interface RegistryItem {
  // Stable key that guests' "finalized" claims are stored under in Firestore.
  // Never change an id once guests can see the item, or its claim is lost.
  id: string;
  name: string;
  note?: string;      // short descriptor shown under the name
  price?: string;     // as displayed, e.g. '$169.99' or '₹7,499'
  store: string;      // shown on the buy link, e.g. 'Amazon'
  link: string;
  // Product photo, imported from src/assets/images/gifts (4:3, product centred
  // on its own background). Falls back to an icon tile when absent.
  image?: string;
  icon?: RegistryIcon;
}

export interface RegistrySection {
  id: string;
  title: string;
  kicker: string;
  items: RegistryItem[];
  comingSoon?: string; // optional "more to come" teaser card after the items
}

export type PayType = 'upi' | 'zelle' | 'venmo';

export interface PayEntry {
  name: string;   // whose handle this is
  handle: string; // UPI ID / Zelle email or phone / Venmo username
}

export interface PayMethod {
  type: PayType;
  enabled: boolean;
  label: string;       // e.g. 'Google Pay (UPI)'
  currency: string;    // e.g. 'INR' or 'USD'
  handleLabel: string; // e.g. 'UPI ID', 'Zelle email', 'Venmo username'
  entries: PayEntry[]; // one per person
}

export const gifts: {
  intro: string;
  registry: { enabled: boolean; heading: string; kicker: string; sections: RegistrySection[] };
  honeymoon: {
    enabled: boolean;
    heading: string;        // shown to family / general guests
    headingFriends: string; // shown on the private friends link
    kicker: string;
    kickerFriends: string;
    blurb: string;
    methods: PayMethod[];
  };
} = {
  intro:
    "Truly, having you celebrate with us in Bikaner means the world. But if you'd like to bless us as we begin this new chapter, here are a few ways to do so.",

  registry: {
    enabled: true,
    heading: 'Gift Registry',
    kicker: 'Pick something from the list for where you live',
    // Prices are approximate (looked up Oct 2026) and vary with sales.
    sections: [
      {
        id: 'us',
        title: 'For US Residents',
        kicker: 'Ships within the US',
        items: [
          {
            id: 'us-skylight-calendar-15',
            name: 'Skylight Calendar 15"',
            note: 'Touchscreen digital calendar & chore chart',
            price: '$319.99',
            store: 'Amazon',
            link: 'https://www.amazon.com/dp/B0C9V811L6',
            image: skylightImg,
            icon: 'calendar',
          },
          {
            id: 'us-breville-barista-express',
            name: 'Breville Barista Express',
            note: 'Espresso machine with a built-in grinder',
            price: '$699.95',
            store: 'Amazon',
            link: 'https://www.amazon.com/dp/B00CH9QWOU',
            image: brevilleImg,
            icon: 'coffee',
          },
          {
            id: 'us-hatch-restore-3',
            name: 'Hatch Restore 3',
            note: 'Sunrise alarm clock & sound machine',
            price: '$169.99',
            store: 'Amazon',
            link: 'https://www.amazon.com/dp/B0DLLSCVZW',
            image: hatchImg,
            icon: 'alarm',
          },
          {
            id: 'us-away-featherlight-backpack-large',
            name: 'Away Large Featherlight Backpack',
            note: 'In Amaro Brown',
            price: '$118',
            store: 'Away',
            link: 'https://www.awaytravel.com/products/featherlight-backpack-large-amaro-brown',
            image: awayImg,
            icon: 'backpack',
          },
          {
            id: 'us-smart-photo-frame',
            name: 'Euphro 15.6" Digital Frame',
            note: 'Touchscreen photo frame, no subscription fee',
            price: '$129.99',
            store: 'Amazon',
            link: 'https://a.co/d/0eip28OR',
            image: smartFrameImg,
            icon: 'frame',
          },
        ],
      },
      {
        id: 'india',
        title: 'For Indian Residents',
        kicker: 'Ships within India',
        items: [
          {
            id: 'in-mokobara-em-cabin-pro',
            name: 'Mokobara Em Cabin Pro',
            note: 'Expandable 8-wheel cabin suitcase',
            price: '₹7,499',
            store: 'Mokobara',
            link: 'https://mokobara.com/products/the-em-cabin-pro',
            image: mokobaraImg,
            icon: 'luggage',
          },
        ],
        comingSoon: 'We’ll be adding a few more, so check back as the day draws closer!',
      },
    ],
  },

  honeymoon: {
    enabled: true,
    heading: 'Shagun',
    headingFriends: 'Honeymoon Fund',
    kicker: 'With Your Blessings',
    kickerFriends: 'Sponsor Our Honeymoon!',
    blurb: '',
    // TODO: replace placeholder handles with your real ones.
    methods: [
      {
        type: 'upi',
        enabled: true,
        label: 'Google Pay (UPI)',
        currency: 'INR',
        handleLabel: 'UPI ID',
        entries: [
          { name: 'Muskaan', handle: 'muskaanchugh.chugh22@okhdfcbank' },
          { name: 'Tanishq', handle: '7999438185@ptyes' },
        ],
      },
      {
        type: 'zelle',
        enabled: true,
        label: 'Zelle',
        currency: 'USD',
        handleLabel: 'Zelle email / phone',
        entries: [
          { name: 'Muskaan', handle: '9496659076' },
          { name: 'Tanishq', handle: '9499980861' },
        ],
      },
      {
        type: 'venmo',
        enabled: true,
        label: 'Venmo',
        currency: 'USD',
        handleLabel: 'Venmo username',
        entries: [
          { name: 'Muskaan', handle: '@Muskaan-Chugh' },
          { name: 'Tanishq', handle: '@Tanishq-Jha' },
        ],
      },
    ],
  },
};
