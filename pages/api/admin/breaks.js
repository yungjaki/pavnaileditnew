import { getDb } from "../../../lib/firebase";
import { parse as parseCookie } from "cookie";

function authed(req) {
  const cookies = parseCookie(req.headers.cookie || "");
  return cookies.adminAuth === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  const db = getDb();
  const ref = db.collection("settings").doc("breaks");

  if (req.method === "GET") {
    const doc = await ref.get();
    return res.status(200).json({ breaks: doc.exists ? doc.data().list || [] : [] });
  }

  if (!authed(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "POST") {
    const { start, end, label } = req.body;
    if (!start || !end) return res.status(400).json({ error: "Missing start/end" });
    const doc = await ref.get();
    const current = doc.exists ? doc.data().list || [] : [];
    const newBreak = { id: Date.now().toString(), start, end, label: label || "" };
    await ref.set({ list: [...current, newBreak] });
    return res.status(200).json({ break: newBreak });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    const doc = await ref.get();
    const current = doc.exists ? doc.data().list || [] : [];
    await ref.set({ list: current.filter(b => b.id !== id) });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
