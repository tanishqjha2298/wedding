# Muskaan &amp; Tanishq — Wedding Invitation &amp; RSVP

An elegant, editorial wedding invitation and RSVP site for our celebrations at
**Gaj Kesri, Bikaner**, on **25 & 26 November 2026**.

Built with React 19 + Vite + TypeScript + Tailwind CSS v4, with an optional
Firebase (Firestore + Google Auth) backend for collecting RSVPs and a private
host dashboard.

---

## What's on the page

- **Hero** — names, live countdown, the real venue photo, and an RSVP call-to-action.
- **Itinerary** — Haldi, Sangeet, Wedding and a friends-only after-party, each with
  dress-code guidance. The friends-only event is revealed via a private link —
  a clean path (`/friends`) or query (`?invite=friends`), remembered for the session.
- **Travel & Stay** — the real Gaj Kesri venue, how to get to Bikaner (air / train /
  road), where you'll stay, what to pack, and what to explore nearby.
- **RSVP** — a friendly multi-step form that saves responses to Firestore.
- **Host console** — a private dashboard at `/#manage` (Google sign-in) showing
  live responses and per-ceremony headcounts. Hidden from regular guests.

---

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase values (see below)
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint      # type-check (tsc --noEmit)
```

> The site runs fine **without** Firebase configured — the hero, itinerary and
> travel sections all work. Only RSVP saving and the host dashboard need it.

---

## Set up your own Firebase (RSVP storage + host login)

This takes ~10 minutes and is free (Firebase "Spark" plan).

1. **Create a project** at <https://console.firebase.google.com> → *Add project*.
2. **Add a Web app**: Project Overview → the `</>` (Web) icon → register the app.
   Firebase shows a `firebaseConfig` object — copy those values into `.env.local`
   (see `.env.example` for the variable names). *These values are not secret;
   they're meant to ship in the browser.*
3. **Enable Firestore**: Build → Firestore Database → *Create database* →
   Production mode → pick a region (e.g. `asia-south1` / Mumbai).
4. **Enable Google sign-in**: Build → Authentication → *Get started* →
   Sign-in method → enable **Google**.
5. **Deploy the security rules** in [`firestore.rules`](./firestore.rules):
   - Edit the email in the `isHostAdmin()` function so it matches the Google
     account you'll sign in with (and keep it in sync with `VITE_ADMIN_EMAIL`).
   - Paste the rules into Firebase Console → Firestore → *Rules* → *Publish*
     (or deploy with the Firebase CLI: `firebase deploy --only firestore:rules`).
6. **Authorize your domain** for sign-in: Authentication → Settings →
   *Authorized domains* → add your Vercel domain (and any custom domain).

The rules keep guest data private: anyone can **create** a correctly-shaped RSVP,
but only the host admin can read, edit or delete them. See
[`security_spec.md`](./security_spec.md) for the full threat model.

---

## Deploy to Vercel

1. Push this repo to GitHub (already done).
2. At <https://vercel.com> → *Add New… → Project* → import this repository.
   Vercel auto-detects Vite (`vercel.json` is included for SPA routing).
3. Add your environment variables (the same `VITE_*` keys from `.env.local`)
   under **Project → Settings → Environment Variables**.
4. Deploy. Every push to the default branch redeploys automatically.
5. (Optional) Add a custom domain under **Project → Settings → Domains**, then add
   that domain to Firebase Authorized domains (step 6 above).

---

## Editing content

Almost everything you'll want to change lives in two files:

- [`src/config.ts`](./src/config.ts) — names, dates, RSVP deadline, venue details, map link.
- [`src/data/events.ts`](./src/data/events.ts) — the itinerary (events, times, descriptions).

### Photos
The real venue photo is `src/assets/images/gaj_kesari.webp`. To add more (couple
photos, the pool/courtyard, evening shots), drop the files into
`src/assets/images/` and import them where you'd like them shown. The social
share preview lives at `public/og-image.webp` — replace it to change the
WhatsApp/Facebook link thumbnail (a `.jpg` gives the widest compatibility).

### Music
The earlier synthesized-shehnai feature was removed. To add a real track later,
drop an audio file in `public/` and wire up a small play/pause button.
