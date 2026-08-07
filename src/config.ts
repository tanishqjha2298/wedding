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

  rsvpDeadline: 'September 10th, 2026',

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
  placeholder?: boolean; // renders as a muted "coming soon" teaser card
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
  wishlist: { enabled: boolean; heading: string; blurb: string; items: WishlistItem[] };
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
    "Truly — having you celebrate with us in Bikaner means the world. But if you'd like to bless us as we begin this new chapter, here are a few ways to do so.",

  wishlist: {
    enabled: true,
    heading: 'Our Wishlist',
    blurb: 'A few things on our wishlist as we start this new adventure together.',
    // Add real prices/links/images anytime — all fields except name are optional.
    items: [
      {
        name: 'Espresso Machine',
        note: 'Breville Bambino Plus — slow mornings, just the two of us',
        link: 'https://www.google.com/search?q=Breville+Bambino+Plus+Espresso+Machine',
      },
      {
        name: 'More coming soon',
        note: 'We’re still curating our list — check back as the day draws closer!',
        placeholder: true,
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
