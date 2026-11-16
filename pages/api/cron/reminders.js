import { bookingsCol } from "../../../lib/firebase";
import { sendReminderToClient, sendDailySummaryToOwner } from "../../../lib/email";
import { todayInSofia, toDateStr } from "../../../lib/bookingRules";

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // "Tomorrow" in Sofia — the server itself runs in UTC.
    const tomorrow = todayInSofia();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toDateStr(tomorrow);

    const snapshot = await bookingsCol().where("date", "==", tomorrowStr).get();
    const bookings = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(a.time).localeCompare(String(b.time)));

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

    await sendDailySummaryToOwner({ date: tomorrowStr, bookings })
      .catch(e => console.error("Daily summary failed:", e.message));

    const sent = clientResults.filter(r => r.status === "fulfilled").length;
    return res.status(200).json({ sent, total: bookings.length, date: tomorrowStr });
  } catch (err) {
    console.error("Reminder cron error:", err);
    return res.status(500).json({ error: "Reminder job failed" });
  }
}
