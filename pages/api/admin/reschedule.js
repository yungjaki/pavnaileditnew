import { requireAdmin, cleanText, TIME_RE } from "../../../lib/security";
import { rescheduleBooking, BookingError } from "../../../lib/bookingOps";
import { isValidDateStr } from "../../../lib/bookingRules";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const id = cleanText(req.body?.id, 64);
  const newDate = cleanText(req.body?.newDate, 10);
  const newTime = cleanText(req.body?.newTime, 5);
  if (!id || !newDate || !newTime) return res.status(400).json({ error: "Missing fields" });
  if (!isValidDateStr(newDate)) return res.status(400).json({ error: "Датата трябва да е във формат ДД.ММ.ГГГГ" });
  if (!TIME_RE.test(newTime)) return res.status(400).json({ error: "Часът трябва да е във формат ЧЧ:ММ" });

  try {
    await rescheduleBooking(id, newDate, newTime);
    return res.status(200).json({ message: "Rescheduled" });
  } catch (err) {
    if (err instanceof BookingError) return res.status(err.status).json({ error: err.message });
    console.error("Reschedule error:", err);
    return res.status(500).json({ error: "Грешка при преместването" });
  }
}
