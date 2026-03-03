import { parse } from "cookie";
import { bookingsCollection } from "../../../lib/firebase";
import { sendCancellationEmail } from "../../../lib/email";

function isAuthenticated(req) {
  const cookies = parse(req.headers.cookie || "");
  return cookies.admin_session === "authenticated";
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing booking id" });

  try {
    const docRef = bookingsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Booking not found" });

    const { name, clientEmail, date, time } = doc.data();
    await docRef.delete();

    // Send cancellation email to client
    if (clientEmail) {
      sendCancellationEmail({ name, email: clientEmail, date, time }).catch((e) =>
        console.error("Cancellation email failed:", e.message)
      );
    }

    return res.status(200).json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("Cancel error:", err);
    return res.status(500).json({ error: "Cancel failed" });
  }
}
