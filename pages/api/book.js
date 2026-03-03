import { IncomingForm } from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { bookingsCol } from "../../lib/firebase";
import { sendClientConfirmation, sendOwnerNotification } from "../../lib/email";

export const config = { api: { bodyParser: false } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {

  // ── GET: return all bookings ──────────────────────────────
  if (req.method === "GET") {
    try {
      const snapshot = await bookingsCol().get();
      const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json({ bookings });
    } catch (err) {
      console.error("GET /api/book error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: create booking ──────────────────────────────────
  if (req.method === "POST") {
    const form = new IncomingForm({ keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err.message);
        return res.status(500).json({ error: "Form parse error", details: err.message });
      }

      try {
        const name         = fields.name?.[0];
        const phone        = fields.phone?.[0];
        const clientEmail  = fields.email?.[0];
        const date         = fields.date?.[0];
        const time         = fields.time?.[0];
        const totalPrice   = fields.totalPrice?.[0];
        const services     = JSON.parse(fields.services?.[0] || "[]");

        if (!name || !phone || !clientEmail || !date || !time) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        // Upload design image to Cloudinary if provided
        let designUrl = "";
        if (files.design?.[0]) {
          const filePath = files.design[0].filepath;
          const upload   = await cloudinary.uploader.upload(filePath, { folder: "pavnailedit_bookings" });
          designUrl      = upload.secure_url;
          try { fs.unlinkSync(filePath); } catch {}
        }

        // Check if slot is taken
        const conflict = await bookingsCol()
          .where("date", "==", date)
          .where("time", "==", time)
          .get();

        if (!conflict.empty) {
          return res.status(400).json({ error: "ALREADY_BOOKED" });
        }

        // Save to Firestore
        const docRef = await bookingsCol().add({
          name, phone, clientEmail, services,
          date, time, designUrl, totalPrice,
          createdAt: new Date().toISOString(),
        });

        // Send emails (non-blocking)
        const emailData = { name, email: clientEmail, phone, date, time, services, totalPrice, designUrl };
        Promise.all([
          sendClientConfirmation(emailData).catch(e => console.error("Client email failed:", e.message)),
          sendOwnerNotification(emailData).catch(e => console.error("Owner email failed:", e.message)),
        ]);

        return res.status(200).json({ message: "Часът е успешно запазен!", id: docRef.id });

      } catch (err) {
        console.error("POST /api/book error:", err.message);
        return res.status(500).json({ error: err.message });
      }
    });

    return;
  }

  // ── DELETE: cancel booking ────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing id" });

      const docRef = bookingsCol().doc(id);
      const doc    = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Not found" });

      const { name, clientEmail, date, time } = doc.data();
      await docRef.delete();

      if (clientEmail) {
        const { sendCancellationEmail } = await import("../../lib/email");
        sendCancellationEmail({ name, email: clientEmail, date, time })
          .catch(e => console.error("Cancellation email failed:", e.message));
      }

      return res.status(200).json({ message: "Deleted" });
    } catch (err) {
      console.error("DELETE /api/book error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
