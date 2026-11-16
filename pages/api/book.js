import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { bookingsCol, slotsCol, settingsDoc } from "../../lib/firebase";
import { sendClientConfirmation, sendOwnerNotification } from "../../lib/email";
import { createBooking, cancelBooking, syncCalendarCreate, BookingError } from "../../lib/bookingOps";
import {
  isValidDateStr, strToDate, earliestBookableDate, todayInSofia, isDateBlocked,
  getSlotsForDate, isInBreak, normaliseSelection, computeSubtotal, describeItems,
  NAIL_LENGTH_PRICES, MAX_ACTIVE_BOOKINGS,
} from "../../lib/bookingRules";
import {
  isAdmin, rateLimit, cleanText, EMAIL_RE, PHONE_RE, TIME_RE, newCancelToken, tokenMatches,
} from "../../lib/security";

export const config = { api: { bodyParser: false } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GIFT_RE = /^[A-Z0-9-]{3,20}$/;

export default async function handler(req, res) {
  try {
    if (req.method === "GET") return await listTakenSlots(req, res);
    if (req.method === "POST") return await create(req, res);
    if (req.method === "DELETE") return await remove(req, res);
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    if (err instanceof BookingError) return res.status(err.status).json({ error: err.code, message: err.message });
    console.error(`${req.method} /api/book error:`, err);
    return res.status(500).json({ error: "SERVER_ERROR", message: "Нещо се обърка. Опитай отново." });
  }
}

// ── GET: only which slots are taken — never personal data ──────────
async function listTakenSlots(req, res) {
  const today = todayInSofia();
  const snapshot = await bookingsCol().select("date", "time").get();
  const slots = snapshot.docs
    .map(d => d.data())
    .filter(b => isValidDateStr(b.date) && strToDate(b.date) >= today)
    .map(b => ({ date: b.date, time: b.time }));
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ slots });
}

// ── POST: create a booking ──────────────────────────────────────────
async function create(req, res) {
  if (!rateLimit(req, res, "book", 6, 10 * 60 * 1000)) return;

  const form = formidable({
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 1,
    maxFields: 20,
    maxFieldsSize: 64 * 1024,
    filter: ({ mimetype }) => Boolean(mimetype && mimetype.startsWith("image/")),
  });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    const tooBig = /maxFileSize|exceeded/i.test(err.message || "");
    return res.status(400).json({
      error: "BAD_FORM",
      message: tooBig ? "Снимката е твърде голяма (макс. 5 MB)." : "Невалидна заявка.",
    });
  }
  const field = (k) => (Array.isArray(fields[k]) ? fields[k][0] : fields[k]);
  const file = files.design?.[0] || null;
  const cleanupTmp = () => { if (file?.filepath) { try { fs.unlinkSync(file.filepath); } catch {} } };

  try {
    // Honeypot: real users never fill this hidden field.
    if (field("website")) return res.status(200).json({ ok: true });

    const name  = cleanText(field("name"), 80);
    const phone = cleanText(field("phone"), 20);
    const email = cleanText(field("email"), 120).toLowerCase();
    const date  = cleanText(field("date"), 10);
    const time  = cleanText(field("time"), 5);
    const nailLength = cleanText(field("nailLength"), 10) || null;
    const giftCode = cleanText(field("giftCode"), 20).toUpperCase() || null;
    const consent = field("consent") === "true";

    const errors = {};
    if (name.length < 2) errors.name = "Въведи име.";
    if (!PHONE_RE.test(phone)) errors.phone = "Въведи валиден телефон.";
    if (!EMAIL_RE.test(email)) errors.email = "Въведи валиден имейл.";
    if (!consent) errors.consent = "Нужно е съгласие за обработка на данните.";
    if (nailLength && !(nailLength in NAIL_LENGTH_PRICES)) errors.nailLength = "Невалидна дължина.";
    if (giftCode && !GIFT_RE.test(giftCode)) errors.giftCode = "Невалиден код.";

    let selection;
    try {
      const raw = JSON.parse(field("services") || "{}");
      // Accept the old array format too: ["Френски", ...] → { Френски: 1 }
      selection = Array.isArray(raw) ? Object.fromEntries(raw.map(n => [n, 1])) : raw;
    } catch { selection = null; }
    const { items, error: svcError } = normaliseSelection(selection);
    if (svcError) errors.services = svcError;
    else if (items.length === 0) errors.services = "Избери поне една услуга.";

    // Date/slot rules — the same ones the calendar uses on the page.
    if (!isValidDateStr(date) || !TIME_RE.test(time)) {
      errors.date = "Избери дата и час.";
    } else {
      const day = strToDate(date);
      if (day < earliestBookableDate()) errors.date = "Трябва да запазиш час поне 3 дни предварително.";
      else if (isDateBlocked(day) || !getSlotsForDate(day).includes(time)) errors.date = "Този час не е наличен.";
      else {
        const breaksDoc = await settingsDoc("breaks").get();
        const breaks = breaksDoc.exists ? breaksDoc.data().list || [] : [];
        if (isInBreak(day, breaks)) errors.date = "В този ден не работя.";
      }
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ error: "VALIDATION", message: Object.values(errors)[0], fields: errors });
    }

    // Cheap early checks so we don't upload a photo for a request that will fail.
    const [slotSnap, legacy, sameEmail, samePhone] = await Promise.all([
      slotsCol().doc(`${date}_${time}`).get(),
      bookingsCol().where("date", "==", date).where("time", "==", time).limit(1).get(),
      bookingsCol().where("clientEmail", "==", email).select("date").get(),
      bookingsCol().where("phone", "==", phone).select("date").get(),
    ]);
    if (slotSnap.exists || !legacy.empty) {
      return res.status(409).json({ error: "ALREADY_BOOKED", message: "Този час вече е зает." });
    }
    // Same limit the page shows — enforced here so it can't be bypassed.
    const today = todayInSofia();
    const upcoming = new Set(
      [...sameEmail.docs, ...samePhone.docs]
        .filter(d => isValidDateStr(d.data().date) && strToDate(d.data().date) >= today)
        .map(d => d.id)
    );
    if (upcoming.size >= MAX_ACTIVE_BOOKINGS) {
      return res.status(400).json({
        error: "LIMIT",
        message: `Вече имаш ${MAX_ACTIVE_BOOKINGS} запазени часа напред. Можеш да запазиш нов, след като мине някой от тях.`,
      });
    }

    let designUrl = "";
    let designPublicId = null;
    if (file) {
      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder: "pavnailedit_bookings",
        resource_type: "image",
      });
      designUrl = upload.secure_url;
      designPublicId = upload.public_id;
    }

    const services = describeItems(items);
    const subtotal = computeSubtotal(items, nailLength);
    const { token, hash } = newCancelToken();

    let result;
    try {
      result = await createBooking({
        name, phone, clientEmail: email, services, date, time,
        designUrl, nailLength, cancelTokenHash: hash, source: "website",
      }, { giftCode, subtotal });
    } catch (err) {
      if (designPublicId) cloudinary.uploader.destroy(designPublicId).catch(() => {});
      throw err;
    }

    const booking = { name, phone, date, time, services, totalPrice: result.totalPrice, nailLength };
    await syncCalendarCreate(result.id, booking);

    const emailData = {
      id: result.id, cancelToken: token, name, email, phone, date, time, services,
      totalPrice: result.totalPrice, designUrl, nailLength,
      giftCode, discount: result.discount ? result.discount.toFixed(2) : null,
    };
    await Promise.all([
      sendClientConfirmation(emailData).catch(e => console.error("Client email failed:", e.message)),
      sendOwnerNotification(emailData).catch(e => console.error("Owner email failed:", e.message)),
    ]);

    return res.status(200).json({
      message: "Часът е успешно запазен!",
      id: result.id, cancelToken: token, date, time, totalPrice: result.totalPrice,
    });
  } finally {
    cleanupTmp();
  }
}

// ── DELETE: admin, or the client with their private cancel token ───
async function remove(req, res) {
  if (!rateLimit(req, res, "cancel", 10, 10 * 60 * 1000)) return;
  const id = cleanText(req.query.id, 64);
  const token = cleanText(req.query.token, 128);
  if (!id) return res.status(400).json({ error: "Missing id" });

  const admin = isAdmin(req);
  if (!admin && !token) return res.status(401).json({ error: "Unauthorized" });

  await cancelBooking(id, {
    byClient: !admin,
    verify: admin ? undefined : (data) => {
      if (!tokenMatches(token, data.cancelTokenHash)) {
        throw new BookingError("FORBIDDEN", "Невалиден линк за отмяна.", 403);
      }
    },
  });
  return res.status(200).json({ message: "Резервацията е отменена." });
}
