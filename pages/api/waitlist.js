import { waitlistCol } from "../../lib/firebase";
import { rateLimit, cleanText, EMAIL_RE, PHONE_RE, TIME_RE } from "../../lib/security";
import { isValidDateStr, strToDate, todayInSofia } from "../../lib/bookingRules";

export default async function handler(req, res) {
  try {
    // POST — join the waitlist for a taken slot
    if (req.method === "POST") {
      if (!rateLimit(req, res, "waitlist", 5, 10 * 60 * 1000)) return;
      const b = req.body || {};
      if (b.website) return res.status(200).json({ ok: true }); // honeypot
      const name = cleanText(b.name, 80);
      const phone = cleanText(b.phone, 20);
      const email = cleanText(b.email, 120).toLowerCase();
      const date = cleanText(b.date, 10);
      const time = cleanText(b.time, 5);

      if (name.length < 2 || !PHONE_RE.test(phone) || !EMAIL_RE.test(email)) {
        return res.status(400).json({ error: "VALIDATION", message: "Попълни име, валиден телефон и имейл." });
      }
      if (!isValidDateStr(date) || !TIME_RE.test(time) || strToDate(date) < todayInSofia()) {
        return res.status(400).json({ error: "VALIDATION", message: "Невалидна дата или час." });
      }

      const existing = await waitlistCol()
        .where("date", "==", date)
        .where("time", "==", time)
        .where("phone", "==", phone)
        .limit(1)
        .get();
      if (!existing.empty) {
        return res.status(409).json({ error: "ALREADY_WAITING", message: "Вече си в списъка за този час." });
      }
      const doc = await waitlistCol().add({
        name, phone, email, date, time,
        notified: false,
        createdAt: new Date().toISOString(),
      });
      return res.status(200).json({ id: doc.id });
    }

    // GET — how many people are waiting for a slot (public, count only)
    if (req.method === "GET") {
      const date = cleanText(req.query.date, 10);
      const time = cleanText(req.query.time, 5);
      if (!isValidDateStr(date) || !TIME_RE.test(time)) return res.status(400).json({ error: "Missing date/time" });
      const snap = await waitlistCol()
        .where("date", "==", date)
        .where("time", "==", time)
        .where("notified", "==", false)
        .count()
        .get();
      return res.status(200).json({ count: snap.data().count });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Waitlist error:", err);
    return res.status(500).json({ error: "SERVER_ERROR", message: "Нещо се обърка. Опитай отново." });
  }
}
