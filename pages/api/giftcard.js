import { giftcardsCollection } from "../../lib/firebase";

export default async function handler(req, res) {
  // GET: check gift card validity
  if (req.method === "GET") {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Missing code" });

    try {
      const snapshot = await giftcardsCollection.where("code", "==", code.toUpperCase()).get();
      if (snapshot.empty) return res.status(404).json({ error: "Invalid code" });

      const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ cards });
    } catch (err) {
      console.error("Giftcard GET error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // PUT: mark gift card as used
  if (req.method === "PUT") {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Missing code" });

    try {
      const snapshot = await giftcardsCollection.where("code", "==", code.toUpperCase()).get();
      if (snapshot.empty) return res.status(404).json({ error: "Card not found" });

      const doc = snapshot.docs[0];
      await doc.ref.update({ used: true, usedAt: new Date().toISOString() });
      return res.status(200).json({ message: "Card marked as used" });
    } catch (err) {
      console.error("Giftcard PUT error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // POST: create a new gift card (admin)
  if (req.method === "POST") {
    const { code, amount } = req.body;
    if (!code || !amount) return res.status(400).json({ error: "Missing code or amount" });

    try {
      await giftcardsCollection.add({
        code: code.toUpperCase(),
        amount: parseFloat(amount),
        used: false,
        createdAt: new Date().toISOString(),
      });
      return res.status(200).json({ message: "Gift card created" });
    } catch (err) {
      console.error("Giftcard POST error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
