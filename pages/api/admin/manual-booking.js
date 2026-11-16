import { requireAdmin, cleanText, EMAIL_RE, TIME_RE } from "../../../lib/security";
import { createBooking, syncCalendarCreate, BookingError } from "../../../lib/bookingOps";
import { isValidDateStr, NAIL_LENGTH_PRICES } from "../../../lib/bookingRules";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const b = req.body || {};
  const name = cleanText(b.name, 80);
  const phone = cleanText(b.phone, 20) || "—";
  const clientEmail = cleanText(b.clientEmail, 120).toLowerCase();
  const date = cleanText(b.date, 10);
  const time = cleanText(b.time, 5);
  const nailLength = b.nailLength in NAIL_LENGTH_PRICES ? b.nailLength : null;
  const rawServices = Array.isArray(b.services) ? b.services : [b.services];
  const services = rawServices.map(s => cleanText(s, 60)).filter(Boolean).slice(0, 20);
  const price = Number.parseFloat(b.totalPrice);
  const source = cleanText(b.source, 20) || "instagram";

  if (!name || !date || !time) {
    return res.status(400).json({ error: "Липсват задължителни полета (Име, Дата, Час)" });
  }
  if (!isValidDateStr(date) || !TIME_RE.test(time)) {
    return res.status(400).json({ error: "Невалидна дата или час" });
  }
  if (clientEmail && !EMAIL_RE.test(clientEmail)) {
    return res.status(400).json({ error: "Невалиден имейл" });
  }

  const booking = {
    name, phone, clientEmail, date, time,
    services: services.length ? services : ["Instagram резервация"],
    totalPrice: Number.isFinite(price) && price >= 0 ? price.toFixed(2) : "0.00",
    nailLength, source,
  };

  try {
    const { id } = await createBooking(booking);
    await syncCalendarCreate(id, booking);
    return res.status(200).json({ id });
  } catch (err) {
    if (err instanceof BookingError) {
      const msg = err.code === "ALREADY_BOOKED" ? `Часът ${time} на ${date} вече е зает` : err.message;
      return res.status(err.status).json({ error: msg });
    }
    console.error("Manual booking error:", err);
    return res.status(500).json({ error: "Грешка при запазването" });
  }
}
