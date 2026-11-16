// All booking writes go through here so the public form, the admin panel and
// the client's own cancel link behave identically.
import { getDb, bookingsCol, giftcardsCol, slotsCol, waitlistCol } from "./firebase";
import { addBookingToCalendar, removeBookingFromCalendar } from "./calendar";
import {
  sendCancellationEmail, sendOwnerCancellationNotice, sendRescheduleEmail, sendWaitlistEmail,
} from "./email";
import { strToDate } from "./bookingRules";

export class BookingError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const slotId = (date, time) => `${date}_${time}`;

/**
 * Atomically reserve the slot, redeem the gift card (if any) and save the booking.
 * `booking` must already be validated. Returns { id, discount, totalPrice }.
 */
export async function createBooking(booking, { giftCode = null, subtotal = null } = {}) {
  const db = getDb();
  const bookingRef = bookingsCol().doc();
  const slotRef = slotsCol().doc(slotId(booking.date, booking.time));

  return db.runTransaction(async (tx) => {
    // ── reads ──
    const slotSnap = await tx.get(slotRef);
    // Older bookings were saved before slot docs existed, so check those too.
    const legacy = await tx.get(
      bookingsCol().where("date", "==", booking.date).where("time", "==", booking.time).limit(1)
    );
    let cardSnap = null;
    if (giftCode) {
      const cards = await tx.get(giftcardsCol().where("code", "==", giftCode).limit(1));
      cardSnap = cards.empty ? null : cards.docs[0];
    }

    if (slotSnap.exists || !legacy.empty) {
      throw new BookingError("ALREADY_BOOKED", "Този час вече е зает.", 409);
    }

    let discount = 0;
    if (giftCode) {
      if (!cardSnap) throw new BookingError("GIFT_INVALID", "Невалиден код на подаръчна карта.");
      const card = cardSnap.data();
      if (card.used) throw new BookingError("GIFT_USED", "Тази подаръчна карта вече е използвана.");
      discount = Math.min(Number(card.amount) || 0, subtotal ?? 0);
    }
    const total = subtotal == null
      ? booking.totalPrice
      : (Math.max(0, subtotal - discount)).toFixed(2);

    // ── writes ──
    tx.create(slotRef, { bookingId: bookingRef.id, createdAt: new Date().toISOString() });
    tx.set(bookingRef, {
      ...booking,
      totalPrice: total,
      ...(giftCode ? { giftCode, giftDiscount: discount.toFixed(2) } : {}),
      createdAt: new Date().toISOString(),
    });
    if (cardSnap) {
      tx.update(cardSnap.ref, { used: true, usedAt: new Date().toISOString(), usedBy: bookingRef.id });
    }
    return { id: bookingRef.id, discount, totalPrice: total };
  }).catch((err) => {
    // Firestore reports a lost create() race as ALREADY_EXISTS (code 6).
    if (err instanceof BookingError) throw err;
    if (err?.code === 6 || /already exists/i.test(err?.message || "")) {
      throw new BookingError("ALREADY_BOOKED", "Този час вече е зает.", 409);
    }
    throw err;
  });
}

/** Add the Google Calendar event after a booking is saved (never throws). */
export async function syncCalendarCreate(id, booking) {
  const calEventId = await addBookingToCalendar(booking);
  if (calEventId) await bookingsCol().doc(id).update({ calEventId }).catch(() => {});
  return calEventId;
}

/**
 * Cancel a booking: frees the slot, restores an unused gift card, removes the
 * calendar event, emails the client/owner and notifies the waitlist.
 * `verify(data)` may throw to reject (used for client cancel tokens).
 */
export async function cancelBooking(id, { byClient = false, verify } = {}) {
  const db = getDb();
  const ref = bookingsCol().doc(id);

  const data = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new BookingError("NOT_FOUND", "Резервацията не е намерена.", 404);
    const d = snap.data();
    if (verify) verify(d);

    const slotRef = slotsCol().doc(slotId(d.date, d.time));
    const slotSnap = await tx.get(slotRef);
    let cardSnap = null;
    if (d.giftCode) {
      const cards = await tx.get(giftcardsCol().where("code", "==", d.giftCode).limit(1));
      cardSnap = cards.empty ? null : cards.docs[0];
    }

    tx.delete(ref);
    if (slotSnap.exists && slotSnap.data().bookingId === id) tx.delete(slotRef);
    if (cardSnap && cardSnap.data().usedBy === id) {
      tx.update(cardSnap.ref, { used: false, usedAt: null, usedBy: null });
    }
    return d;
  });

  if (data.calEventId) {
    removeBookingFromCalendar(data.calEventId).catch(e => console.error("Calendar delete failed:", e.message));
  }
  const jobs = [];
  if (data.clientEmail) {
    jobs.push(sendCancellationEmail({ name: data.name, email: data.clientEmail, date: data.date, time: data.time })
      .catch(e => console.error("Cancel email failed:", e.message)));
  }
  if (byClient) {
    jobs.push(sendOwnerCancellationNotice({ name: data.name, date: data.date, time: data.time, byClient })
      .catch(e => console.error("Owner cancel email failed:", e.message)));
  }
  jobs.push(notifyWaitlist(data.date, data.time).catch(e => console.error("Waitlist notify failed:", e.message)));
  await Promise.all(jobs);
  return data;
}

/** Move a booking to a new slot atomically, then update calendar + email. */
export async function rescheduleBooking(id, newDate, newTime) {
  const db = getDb();
  const ref = bookingsCol().doc(id);
  const newSlotRef = slotsCol().doc(slotId(newDate, newTime));

  const old = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new BookingError("NOT_FOUND", "Резервацията не е намерена.", 404);
    const d = snap.data();
    if (d.date === newDate && d.time === newTime) return d;

    const oldSlotRef = slotsCol().doc(slotId(d.date, d.time));
    const [newSlot, oldSlot, legacy] = await Promise.all([
      tx.get(newSlotRef),
      tx.get(oldSlotRef),
      tx.get(bookingsCol().where("date", "==", newDate).where("time", "==", newTime).limit(1)),
    ]);
    const takenByOther = (newSlot.exists && newSlot.data().bookingId !== id)
      || (!legacy.empty && legacy.docs[0].id !== id);
    if (takenByOther) throw new BookingError("ALREADY_BOOKED", "Новият час вече е зает.", 409);

    if (oldSlot.exists && oldSlot.data().bookingId === id) tx.delete(oldSlotRef);
    tx.set(newSlotRef, { bookingId: id, createdAt: new Date().toISOString() });
    tx.update(ref, { date: newDate, time: newTime });
    return d;
  });

  if (old.date === newDate && old.time === newTime) return old;

  // Move the calendar event: delete the old one, create a fresh one.
  if (old.calEventId) {
    await removeBookingFromCalendar(old.calEventId).catch(() => {});
  }
  const calEventId = await addBookingToCalendar({ ...old, date: newDate, time: newTime });
  await ref.update({ calEventId: calEventId || null }).catch(() => {});

  const jobs = [notifyWaitlist(old.date, old.time).catch(e => console.error("Waitlist notify failed:", e.message))];
  if (old.clientEmail) {
    jobs.push(sendRescheduleEmail({
      name: old.name, email: old.clientEmail,
      oldDate: old.date, oldTime: old.time, newDate, newTime,
    }).catch(e => console.error("Reschedule email failed:", e.message)));
  }
  await Promise.all(jobs);
  return old;
}

/** Email the first person waiting for a slot that just became free. */
export async function notifyWaitlist(date, time) {
  // Don't notify for a slot that's already in the past.
  const [hh, mm] = String(time).split(":").map(Number);
  const when = strToDate(date);
  when.setHours(hh || 0, mm || 0);
  if (when < new Date()) return;

  const snap = await waitlistCol()
    .where("date", "==", date)
    .where("time", "==", time)
    .where("notified", "==", false)
    .orderBy("createdAt", "asc")
    .limit(1)
    .get();
  if (snap.empty) return;

  const doc = snap.docs[0];
  const { name, email } = doc.data();
  await doc.ref.update({ notified: true, notifiedAt: new Date().toISOString() });
  await sendWaitlistEmail({ name, email, date, time });
}
