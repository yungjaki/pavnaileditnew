import { settingsDoc } from "../../../lib/firebase";
import { requireAdmin, cleanText } from "../../../lib/security";
import { ISO_DATE_RE } from "../../../lib/bookingRules";

export default async function handler(req, res) {
  // Check admin before touching the database for anything but the public GET.
  if (req.method !== "GET" && !requireAdmin(req, res)) return;
  let ref;

  try {
    ref = settingsDoc("breaks");
    // Public GET — the booking calendar needs to grey these days out.
    if (req.method === "GET") {
      const doc = await ref.get();
      return res.status(200).json({ breaks: doc.exists ? doc.data().list || [] : [] });
    }

    if (req.method === "POST") {
      const start = cleanText(req.body?.start, 10);
      const end = cleanText(req.body?.end, 10);
      const label = cleanText(req.body?.label, 80);
      if (!ISO_DATE_RE.test(start) || !ISO_DATE_RE.test(end)) return res.status(400).json({ error: "Невалидни дати" });
      if (start > end) return res.status(400).json({ error: "Началната дата трябва да е преди крайната" });
      const doc = await ref.get();
      const current = doc.exists ? doc.data().list || [] : [];
      const newBreak = { id: Date.now().toString(), start, end, label };
      await ref.set({ list: [...current, newBreak] });
      return res.status(200).json({ break: newBreak });
    }

    if (req.method === "DELETE") {
      const id = cleanText(req.query.id, 32);
      const doc = await ref.get();
      const current = doc.exists ? doc.data().list || [] : [];
      await ref.set({ list: current.filter(b => b.id !== id) });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Breaks error:", err);
    return res.status(500).json({ error: "Грешка" });
  }
}
