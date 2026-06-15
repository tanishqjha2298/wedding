/**
 * Single source of truth for editable site content.
 * Tweak names, dates, venue and links here — everything else reads from this.
 */

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

  rsvpDeadline: 'August 1st, 2026',

  venue: {
    name: 'Gaj Kesri',
    fullName: 'Brij Gaj Kesri — A Boutique Luxury Palace',
    addressLine: 'Bypass Road, Bikaner, Rajasthan 334001, India',
    city: 'Bikaner, Rajasthan, India',
    // Opens Google Maps to the venue (no API key needed).
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Brij%20Gaj%20Kesri%20Bikaner',
  },
} as const;

// ── Gifts & Blessings page ──────────────────────────────────────────────────
// Edit your curated wishlist and honeymoon-fund payment handles here.

export interface WishlistItem {
  name: string;
  note?: string;   // a short line about why you'd love it
  price?: string;  // free text, e.g. '$350' or '₹5,000'
  link?: string;   // where to buy / view (optional)
  image?: string;  // image URL (optional)
}

export type PayType = 'upi' | 'zelle' | 'venmo';

export interface PayMethod {
  type: PayType;
  enabled: boolean;
  label: string;       // e.g. 'Google Pay (UPI)'
  currency: string;    // e.g. 'INR' or 'USD'
  handle: string;      // UPI ID / Zelle email or phone / Venmo username
  handleLabel: string; // e.g. 'UPI ID', 'Zelle email', 'Venmo username'
  name?: string;       // account holder name (used for the UPI pay link)
}

export const gifts: {
  intro: string;
  wishlist: { enabled: boolean; heading: string; blurb: string; items: WishlistItem[] };
  honeymoon: { enabled: boolean; heading: string; blurb: string; methods: PayMethod[] };
} = {
  intro:
    "Truly — having you celebrate with us in Bikaner means the world. But if you'd like to bless us as we begin this new chapter, here are a few ways to do so.",

  wishlist: {
    enabled: true,
    heading: 'Our Wishlist',
    blurb: 'A few things we’re dreaming of for our first home together.',
    // TODO: replace these samples with your curated list.
    items: [
      {
        name: 'Le Creuset Dutch Oven',
        note: 'For our first home-cooked meals together',
        price: '$350',
        link: '',
      },
      {
        name: 'Espresso Machine',
        note: 'Slow mornings, just the two of us',
        price: '$600',
        link: '',
      },
      {
        name: 'Handwoven Throw Blanket',
        note: 'Cozy evenings in',
        price: '$120',
        link: '',
      },
    ],
  },

  honeymoon: {
    enabled: true,
    heading: 'Honeymoon Fund',
    blurb: '',
    // TODO: replace placeholder handles with your real ones.
    methods: [
      {
        type: 'upi',
        enabled: true,
        label: 'Google Pay (UPI)',
        currency: 'INR',
        handle: 'muskaanchugh.chugh22@okhdbcbank',
        handleLabel: 'UPI ID',
        name: 'Muskaan Chugh',
      },
      {
        type: 'zelle',
        enabled: true,
        label: 'Zelle',
        currency: 'USD',
        handle: '9496659076',
        handleLabel: 'Zelle email / phone',
        name: 'Muskaan Chugh',
      },
      {
        type: 'venmo',
        enabled: true,
        label: 'Venmo',
        currency: 'USD',
        handle: '@Muskaan-Chugh',
        handleLabel: 'Venmo username',
      },
    ],
  },
};
