import { giftcardsCol } from "../../lib/firebase";
import { requireAdmin, rateLimit, cleanText } from "../../lib/security";

const CODE_RE = /^[A-Z0-9-]{3,20}$/;

export default async function handler(req, res) {
  try {
    // GET: check a code (public, rate-limited so codes can't be guessed).
    // Redemption happens on the server inside the booking — never from the browser.
    if (req.method === "GET") {
      if (!rateLimit(req, res, "giftcard-check", 10, 10 * 60 * 1000)) return;
      const code = cleanText(req.query.code, 20).toUpperCase();
      if (!CODE_RE.test(code)) return res.status(404).json({ valid: false, error: "Invalid code" });
      const snapshot = await giftcardsCol().where("code", "==", code).limit(1).get();
      if (snapshot.empty) return res.status(404).json({ valid: false, error: "Invalid code" });
      const card = snapshot.docs[0].data();
      if (card.used) return res.status(200).json({ valid: false, used: true });
      return res.status(200).json({ valid: true, amount: Number(card.amount) || 0 });
    }

    // POST: create (admin only)
    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;
      const code = cleanText(req.body?.code, 20).toUpperCase();
      const amount = Number.parseFloat(req.body?.amount);
      if (!CODE_RE.test(code)) return res.status(400).json({ error: "Кодът трябва да е 3–20 букви/цифри" });
      if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) {
        return res.status(400).json({ error: "Невалидна сума" });
      }
      const existing = await giftcardsCol().where("code", "==", code).limit(1).get();
      if (!existing.empty) return res.status(409).json({ error: "Този код вече съществува" });
      await giftcardsCol().add({ code, amount, used: false, createdAt: new Date().toISOString() });
      return res.status(200).json({ message: "Gift card created" });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Giftcard error:", err);
    return res.status(500).json({ error: "Грешка" });
  }
}
