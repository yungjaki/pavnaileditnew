import { requireAdmin, cleanText } from "../../../lib/security";
import { cancelBooking, BookingError } from "../../../lib/bookingOps";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const id = cleanText(req.body?.id, 64);
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    await cancelBooking(id, { byClient: false });
    return res.status(200).json({ message: "Cancelled" });
  } catch (err) {
    if (err instanceof BookingError) return res.status(err.status).json({ error: err.message });
    console.error("Cancel error:", err);
    return res.status(500).json({ error: "Грешка при отмяната" });
  }
}
