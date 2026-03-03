import { parse } from "cookie";
import { bookingsCol } from "../../../lib/firebase";

function isAuthenticated(req) {
  const cookies = parse(req.headers.cookie || "");
  return cookies.admin_session === "authenticated";
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const snapshot = await bookingsCol().get();
    const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error("Admin bookings error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
