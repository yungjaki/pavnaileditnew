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

#### Firebase (Admin SDK)
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key" → download the JSON
3. Copy `project_id`, `client_email`, and `private_key` into `.env.local`

#### Cloudinary
1. Go to [cloudinary.com](https://cloudinary.com) → Dashboard
2. Copy Cloud Name, API Key, and API Secret

#### Gmail (Nodemailer) ✉️
1. Use any Gmail account as the sender (e.g. a dedicated `pavnailedit.noreply@gmail.com`)
2. Make sure **2-Step Verification** is ON for that Gmail account
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Create a new App Password → name it "PavNailedIt"
5. Copy the 16-character password into `GMAIL_APP_PASSWORD`
6. Set `GMAIL_USER` to that Gmail address
7. Booking notifications go to `pavlina.dochevaas@gmail.com` (already hardcoded)

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Add all `.env.local` variables in Vercel Dashboard → Settings → Environment Variables.

---

## How emails work

When a booking is submitted:
1. ✅ **Client gets** a beautiful HTML confirmation email with their booking details
2. ✅ **Pavlina gets** a notification email with all client info + design image link

When a booking is cancelled (via admin):
- ✅ **Client gets** a cancellation email

---

## Project Structure

```
pages/
  index.js          → Home page
  book.js           → Booking form
  already-booked.js → Confirmation / active booking page
  pics.js           → Gallery
  api/
    book.js         → Bookings CRUD + email sending
    giftcard.js     → Gift card check/use/create
    admin.js        → Admin endpoints
lib/
  firebase.js       → Firebase Admin SDK init
  email.js          → SendGrid email functions
styles/
  globals.css       → Global styles
```
