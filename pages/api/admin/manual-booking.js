import { bookingsCol } from "../../../lib/firebase";
import { parse as parseCookie } from "cookie";

function authed(req) {
  const cookies = parseCookie(req.headers.cookie || "");
  return cookies.adminAuth === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, phone, clientEmail, date, time, services, totalPrice, nailLength, source } = req.body;

  if (!name || !date || !time) {
    return res.status(400).json({ error: "Липсват задължителни полета (Име, Дата, Час)" });
  }

  // Check if slot is already taken
  const snapshot = await bookingsCol()
    .where("date", "==", date)
    .where("time", "==", time)
    .get();

  if (!snapshot.empty) {
    return res.status(409).json({ error: `Часът ${time} на ${date} вече е зает` });
  }

  const docRef = await bookingsCol().add({
    name,
    phone: phone || "—",
    clientEmail: clientEmail || "",
    date,
    time,
    services: Array.isArray(services) ? services : [services],
    totalPrice: totalPrice || "0",
    nailLength: nailLength || null,
    source: source || "instagram",
    createdAt: new Date().toISOString(),
  });

  return res.status(200).json({ id: docRef.id });
}
