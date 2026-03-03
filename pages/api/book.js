import { IncomingForm } from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { bookingsCollection } from "../../lib/firebase";
import { sendClientConfirmation, sendOwnerNotification } from "../../lib/email";

export const config = {
  api: { bodyParser: false },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  // --- GET: return all bookings for the calendar ---
  if (req.method === "GET") {
    try {
      const snapshot = await bookingsCollection.get();
      const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ bookings });
    } catch (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }

  // --- POST: create a new booking ---
  if (req.method === "POST") {
    const form = new IncomingForm({ keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "Form parse error", details: err.message });
      }

      try {
        const name = fields.name?.[0];
        const phone = fields.phone?.[0];
        const clientEmail = fields.email?.[0];
        const date = fields.date?.[0];
        const time = fields.time?.[0];
        const totalPrice = fields.totalPrice?.[0];
        const services = JSON.parse(fields.services?.[0] || "[]");

        if (!name || !phone || !clientEmail || !date || !time) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        // Upload design image to Cloudinary if provided
        let designUrl = "";
        if (files.design && files.design[0]) {
          const filePath = files.design[0].filepath;
          const upload = await cloudinary.uploader.upload(filePath, {
            folder: "pavnailedit_bookings",
          });
          designUrl = upload.secure_url;
          fs.unlinkSync(filePath);
        }

        // Check if the slot is already taken
        const snapshot = await bookingsCollection
          .where("date", "==", date)
          .where("time", "==", time)
          .get();

        if (!snapshot.empty) {
          return res.status(400).json({ error: "ALREADY_BOOKED" });
        }

        // Save booking to Firestore
        const docRef = await bookingsCollection.add({
          name,
          phone,
          clientEmail,
          services,
          date,
          time,
          designUrl,
          totalPrice,
          createdAt: new Date().toISOString(),
        });

        // ✅ Send emails (non-blocking - don't fail booking if email fails)
        const emailData = { name, email: clientEmail, phone, date, time, services, totalPrice, designUrl };

        Promise.all([
          sendClientConfirmation(emailData).catch((e) =>
            console.error("Client email failed:", e?.response?.body || e.message)
          ),
          sendOwnerNotification(emailData).catch((e) =>
            console.error("Owner email failed:", e?.response?.body || e.message)
          ),
        ]);

        return res.status(200).json({
          message: "Часът е успешно запазен!",
          id: docRef.id,
        });
      } catch (err) {
        console.error("Booking error:", err);
        return res.status(500).json({ error: "Booking failed", details: err.message });
      }
    });

    return; // prevent headers-already-sent error
  }

  // --- DELETE: cancel a booking (admin use) ---
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing booking id" });

      const docRef = bookingsCollection.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Booking not found" });

      const { name, clientEmail, date, time } = doc.data();

      await docRef.delete();

      // Send cancellation email
      if (clientEmail) {
        const { sendCancellationEmail } = await import("../../lib/email");
        sendCancellationEmail({ name, email: clientEmail, date, time }).catch((e) =>
          console.error("Cancellation email failed:", e.message)
        );
      }

      return res.status(200).json({ message: "Booking deleted" });
    } catch (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Delete failed" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
