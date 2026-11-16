import { bookingsCol } from "../../../lib/firebase";
import { requireAdmin } from "../../../lib/security";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const snapshot = await bookingsCol().get();
    // Never send the cancel-token hash to the browser.
    const bookings = snapshot.docs.map(d => {
      const { cancelTokenHash, ...rest } = d.data();
      return { id: d.id, ...rest };
    });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error("Admin bookings error:", err);
    return res.status(500).json({ error: "Грешка при зареждането" });
  }
}
