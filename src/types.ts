export interface WeddingEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  vibe: string;
  isFriendsOnly?: boolean;
}

export type AttendanceOption =
  | 'YES' // "Count me in! Wouldn't miss it."
  | 'NO'  // "Sending love from afar. Sadly can't make it."
  | 'VISA'; // "Counting down the days—will absolutely be there if my visa permits!"

// Which side of the family the guest is joining from.
export type GuestSide = 'BRIDE' | 'GROOM' | 'BOTH';

export interface RsvpFormState {
  fullName: string;             // primary guest
  additionalGuests: string[];   // up to 2 more named guests
  side: GuestSide | null;
  attendance: AttendanceOption | null;
  selectedEvents: { [eventId: string]: boolean }; // Track attendance per event if attending
  songRequest: string;
}
