import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function getDb() {
  if (getApps().length === 0) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
    const serviceAccount = JSON.parse(raw);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

export function bookingsCol()  { return getDb().collection("bookings"); }
export function giftcardsCol() { return getDb().collection("giftcards"); }
export function waitlistCol()  { return getDb().collection("waitlist"); }
// One document per taken slot ("dd.mm.yyyy_HH:MM"). Creating it inside a
// transaction is what makes double booking impossible.
export function slotsCol()     { return getDb().collection("slots"); }
export function settingsDoc(name) { return getDb().collection("settings").doc(name); }
