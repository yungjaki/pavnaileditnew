import { getDb } from "../../lib/firebase";
import { createTransporter } from "../../lib/email";

// Helper to get waitlist collection
function waitlistCol() {
  return getDb().collection("waitlist");
}

export default async function handler(req, res) {
  // POST — join waitlist
  if (req.method === "POST") {
    const { name, phone, email, date, time } = req.body;
    if (!name || !phone || !email || !date || !time) {
      return res.status(400).json({ error: "Missing fields" });
    }
    // Check not already on waitlist for this slot
    const existing = await waitlistCol()
      .where("date", "==", date)
      .where("time", "==", time)
      .where("phone", "==", phone)
      .get();
    if (!existing.empty) {
      return res.status(409).json({ error: "ALREADY_WAITING" });
    }
    const doc = await waitlistCol().add({
      name, phone, email, date, time,
      notified: false,
      createdAt: new Date().toISOString(),
    });
    return res.status(200).json({ id: doc.id });
  }

  // GET — check waitlist count for a slot (public)
  if (req.method === "GET") {
    const { date, time } = req.query;
    if (!date || !time) return res.status(400).json({ error: "Missing date/time" });
    const snap = await waitlistCol()
      .where("date", "==", date)
      .where("time", "==", time)
      .where("notified", "==", false)
      .get();
    return res.status(200).json({ count: snap.size });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// Called internally when a booking is cancelled — notify first person on waitlist
export async function notifyWaitlist(date, time) {
  const snap = await waitlistCol()
    .where("date", "==", date)
    .where("time", "==", time)
    .where("notified", "==", false)
    .orderBy("createdAt", "asc")
    .limit(1)
    .get();

  if (snap.empty) return;

  const doc  = snap.docs[0];
  const { name, email, phone } = doc.data();

  // Mark as notified
  await doc.ref.update({ notified: true, notifiedAt: new Date().toISOString() });

  // Send email
  try {
    const transport = createTransporter();
    await transport.sendMail({
      from: `"PavNailedIt 💅" <pavlina.dochevaas@gmail.com>`,
      to: email,
      subject: `🎉 Освободи се час – ${date} в ${time}!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#f8b7d1,#ff6ec4);padding:28px 32px;text-align:center;">
            <div style="font-size:2.5rem;margin-bottom:8px;">🎉</div>
            <h1 style="color:#fff;margin:0;font-size:1.4rem;">Освободи се час!</h1>
          </div>
          <div style="padding:28px 32px;color:#555;line-height:1.7;">
            <p>Здравей, <strong>${name}</strong>! 💖</p>
            <p>Беше в чакащия списък и се освободи час:</p>
            <div style="background:linear-gradient(135deg,#fff5fb,#ffe8f4);border-radius:14px;padding:18px 20px;margin:16px 0;text-align:center;">
              <div style="font-size:1.5rem;font-weight:800;color:#e0559e;">${date}</div>
              <div style="font-size:1.1rem;color:#c994b0;">в ${time}</div>
            </div>
            <p>Побързай — часовете се вземат бързо! 🌸</p>
            <div style="text-align:center;margin-top:24px;">
              <a href="https://pavnailedit.vercel.app/book" style="display:inline-block;background:linear-gradient(135deg,#f8b7d1,#ff6ec4);color:#fff;padding:14px 32px;border-radius:50px;font-weight:700;text-decoration:none;font-size:1rem;box-shadow:0 6px 20px rgba(255,110,196,0.35);">
                Запази час сега →
              </a>
            </div>
            <p style="margin-top:24px;font-size:0.85rem;color:#aaa;">
              Ако не успееш да запазиш, ще уведомим следващия в списъка.
            </p>
            <p>До скоро! 💖<br><strong>Павлина — PavNailedIt</strong></p>
          </div>
        </div>`,
    });
  } catch (e) {
    console.error("Waitlist email failed:", e.message);
  }
}
