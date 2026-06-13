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

  rsvpDeadline: 'October 1st, 2026',

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
