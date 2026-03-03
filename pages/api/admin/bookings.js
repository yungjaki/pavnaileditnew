import { parse } from "cookie";
import { bookingsCollection } from "../../../lib/firebase";

function isAuthenticated(req) {
  const cookies = parse(req.headers.cookie || "");
  return cookies.admin_session === "authenticated";
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).end();

  try {
    const snapshot = await bookingsCollection.get();
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error("Admin bookings error:", err);
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
}
