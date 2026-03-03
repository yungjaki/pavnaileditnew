import { giftcardsCol } from "../../lib/firebase";

export default async function handler(req, res) {

  // GET: check gift card
  if (req.method === "GET") {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Missing code" });
    try {
      const snapshot = await giftcardsCol().where("code", "==", code.toUpperCase()).get();
      if (snapshot.empty) return res.status(404).json({ error: "Invalid code" });
      const cards = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json({ cards });
    } catch (err) {
      console.error("Giftcard GET error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT: mark as used
  if (req.method === "PUT") {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Missing code" });
    try {
      const snapshot = await giftcardsCol().where("code", "==", code.toUpperCase()).get();
      if (snapshot.empty) return res.status(404).json({ error: "Not found" });
      await snapshot.docs[0].ref.update({ used: true, usedAt: new Date().toISOString() });
      return res.status(200).json({ message: "Marked as used" });
    } catch (err) {
      console.error("Giftcard PUT error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST: create
  if (req.method === "POST") {
    const { code, amount } = req.body;
    if (!code || !amount) return res.status(400).json({ error: "Missing code or amount" });
    try {
      await giftcardsCol().add({
        code: code.toUpperCase(),
        amount: parseFloat(amount),
        used: false,
        createdAt: new Date().toISOString(),
      });
      return res.status(200).json({ message: "Gift card created" });
    } catch (err) {
      console.error("Giftcard POST error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
