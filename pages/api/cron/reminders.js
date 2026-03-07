import { bookingsCol } from "../../../lib/firebase";
import { sendReminderToClient, sendDailySummaryToOwner } from "../../../lib/email";

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Tomorrow in dd.mm.yyyy
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dd   = String(tomorrow.getDate()).padStart(2, "0");
  const mm   = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const yyyy = tomorrow.getFullYear();
  const tomorrowStr = `${dd}.${mm}.${yyyy}`;

  const snapshot = await bookingsCol().where("date", "==", tomorrowStr).get();
  const bookings = snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.time.localeCompare(b.time));

  if (bookings.length === 0) {
    return res.status(200).json({ sent: 0, message: "No bookings tomorrow" });
  }

  const clientResults = await Promise.allSettled(
    bookings
      .filter(b => b.clientEmail)
      .map(b => sendReminderToClient({
        name: b.name, email: b.clientEmail, date: b.date,
        time: b.time, services: b.services,
        totalPrice: b.totalPrice, nailLength: b.nailLength,
      }))
  );

  await sendDailySummaryToOwner({ date: tomorrowStr, bookings });

  const sent = clientResults.filter(r => r.status === "fulfilled").length;
  return res.status(200).json({ sent, total: bookings.length, date: tomorrowStr });
}
