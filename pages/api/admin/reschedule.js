import { parse } from "cookie";
import { bookingsCol } from "../../../lib/firebase";
import nodemailer from "nodemailer";

function isAuthenticated(req) {
  const cookies = parse(req.headers.cookie || "");
  return cookies.admin_session === "authenticated";
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, newDate, newTime } = req.body;
  if (!id || !newDate || !newTime) return res.status(400).json({ error: "Missing fields" });

  try {
    const conflict = await bookingsCol()
      .where("date", "==", newDate)
      .where("time", "==", newTime)
      .get();

    if (!conflict.empty && conflict.docs[0].id !== id) {
      return res.status(400).json({ error: "Новият час вече е зает" });
    }

    const docRef = bookingsCol().doc(id);
    const doc    = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Not found" });

    const { name, clientEmail, date: oldDate, time: oldTime } = doc.data();
    await docRef.update({ date: newDate, time: newTime });

    if (clientEmail) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });
      transporter.sendMail({
        from: `"PavNailedIt 💅" <${process.env.GMAIL_USER}>`,
        to: clientEmail,
        subject: `📅 Твоят час е преместен – ${newDate} в ${newTime}`,
        html: `<p>Здравей, <strong>${name}</strong>!<br>Стар: ${oldDate} ${oldTime}<br>Нов: <strong>${newDate} ${newTime}</strong></p>`,
      }).catch(e => console.error("Reschedule email failed:", e.message));
    }

    return res.status(200).json({ message: "Rescheduled" });
  } catch (err) {
    console.error("Reschedule error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
