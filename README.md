# 💅 PavNailedIt – Next.js

Nail salon booking site for [pavnailed.it](https://pavnailed.it)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create your `.env.local` file
Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

**Never put real values in `.env.local.example`** — it is a template that gets shared.
Every variable is described in that file. The important ones:

| Variable | What it's for |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Firestore (bookings, gift cards, waitlist, settings) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN` / `TECH_CALENDAR_ID` | Google Calendar sync |
| `CLOUDINARY_*` | Design and inspiration photo uploads |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` / `OWNER_EMAIL` | Sending emails (nodemailer + Gmail App Password) |
| `ADMIN_PASSWORD` | Admin panel login (no default — login is disabled if unset) |
| `SESSION_SECRET` | Signs admin sessions (32+ random characters) |
| `CRON_SECRET` | Protects the daily reminder job |
| `SITE_URL` | Base URL used in email links |

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
Add all `.env.local` variables in Vercel Dashboard → Settings → Environment Variables.

---

## How bookings work

- The booking page loads only **which slots are taken** (`GET /api/book`) — never names, phones or emails.
- `POST /api/book` re-validates everything on the server: date/slot rules (`lib/bookingRules.js`, shared with the page),
  prices (the server computes the total), the 3-upcoming-bookings limit, and gift cards.
- Slots are reserved in a Firestore transaction (`slots` collection, one doc per `date_time`), so two people can never
  book the same slot. The gift card is redeemed in the same transaction.
- The client receives a private **cancel link** by email (and the token is stored on their device), so only they — or the
  admin — can cancel. Cancelling frees the slot, restores an unused gift card, removes the calendar event and emails
  the first person on the waitlist.

## Emails

- New booking → client confirmation (with cancel link) + owner notification
- Cancellation → client email (+ owner email when the client cancels)
- Reschedule (admin) → client email; calendar event is moved
- Free slot → first person on the waitlist
- Daily 07:00 UTC cron → reminders for tomorrow + owner's summary

## Firestore indexes

The waitlist notification query (`date`, `time`, `notified`, ordered by `createdAt`) needs a composite index.
Firestore logs a direct link to create it the first time the query runs.

## Project structure

```
pages/
  index.js          → Home page
  book.js           → Booking form
  already-booked.js → Confirmation / "my bookings" / cancel page
  pics.js           → Gallery
  aftercare.js      → Aftercare guide
  privacy.js        → Privacy policy
  admin/index.js    → Admin panel
  api/
    book.js         → Taken slots, create booking, cancel (admin or cancel token)
    giftcard.js     → Check code (public, rate-limited) / create (admin)
    waitlist.js     → Join waitlist
    admin/*         → Admin-only endpoints (signed session cookie)
    cron/reminders  → Daily reminder job
lib/
  bookingRules.js   → Services, prices, slots, blocked days (shared client + server)
  bookingOps.js     → Create / cancel / reschedule (transactions, calendar, emails)
  security.js       → Admin sessions, rate limiting, escaping, validation
  firebase.js       → Firebase Admin SDK init
  email.js          → Email templates (nodemailer)
  calendar.js       → Google Calendar sync
```
