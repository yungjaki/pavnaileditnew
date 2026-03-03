import { parse } from "cookie";
import { bookingsCollection } from "../../../lib/firebase";
import nodemailer from "nodemailer";

function isAuthenticated(req) {
  const cookies = parse(req.headers.cookie || "");
  return cookies.admin_session === "authenticated";
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).end();

  const { id, newDate, newTime } = req.body;
  if (!id || !newDate || !newTime) return res.status(400).json({ error: "Missing fields" });

  try {
    // Check if new slot is free
    const conflict = await bookingsCollection
      .where("date", "==", newDate)
      .where("time", "==", newTime)
      .get();

    if (!conflict.empty && conflict.docs[0].id !== id) {
      return res.status(400).json({ error: "Новият час вече е зает" });
    }

    const docRef = bookingsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Booking not found" });

    const { name, clientEmail, date: oldDate, time: oldTime } = doc.data();

    await docRef.update({ date: newDate, time: newTime });

    // Notify client of reschedule
    if (clientEmail) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      transporter.sendMail({
        from: `"PavNailedIt 💅" <${process.env.GMAIL_USER}>`,
        to: clientEmail,
        subject: `📅 Твоят час е преместен – ${newDate} в ${newTime}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:15px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#f8b7d1,#f9a1c2);padding:25px 30px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:1.4rem;">📅 Промяна на час</h1>
            </div>
            <div style="padding:30px;color:#555;line-height:1.7;">
              <p>Здравей, <strong>${name}</strong>!</p>
              <p>Твоят час беше преместен:</p>
              <p>❌ Стар: <strong>${oldDate}</strong> в <strong>${oldTime}</strong></p>
              <p>✅ Нов: <strong>${newDate}</strong> в <strong>${newTime}</strong></p>
              <p>За въпроси: <a href="https://instagram.com/pavnailedit" style="color:#f9a1c2;">@pavnailedit</a></p>
              <p>До скоро! 💖<br><strong>Павлина</strong></p>
            </div>
          </div>
        `,
      }).catch((e) => console.error("Reschedule email failed:", e.message));
    }

    return res.status(200).json({ message: "Rescheduled" });
  } catch (err) {
    console.error("Reschedule error:", err);
    return res.status(500).json({ error: "Reschedule failed" });
  }
}
