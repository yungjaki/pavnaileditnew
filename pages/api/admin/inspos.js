import { getDb } from "../../../lib/firebase";
import { parse as parseCookie } from "cookie";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";

export const config = { api: { bodyParser: false } };

function authed(req) {
  const cookies = parseCookie(req.headers.cookie || "");
  return cookies.adminAuth === process.env.ADMIN_PASSWORD;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  const db  = getDb();
  const ref = db.collection("settings").doc("inspos");

  // Public GET — booking page needs this
  if (req.method === "GET") {
    const doc = await ref.get();
    return res.status(200).json({ inspos: doc.exists ? doc.data().list || [] : [] });
  }

  if (!authed(req)) return res.status(401).json({ error: "Unauthorized" });

  // POST — upload new inspo
  if (req.method === "POST") {
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const title    = fields.title?.[0] || "Без заглавие";
    const category = fields.category?.[0] || "art";
    const autoServices = JSON.parse(fields.autoServices?.[0] || "[]");
    const autoAddons   = JSON.parse(fields.autoAddons?.[0]   || "[]");
    const autoLength   = fields.autoLength?.[0] || "medium";

    let src = null;
    const file = files.image?.[0];
    if (file) {
      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder: "pavnailedit/inspos",
        transformation: [{ width: 600, height: 800, crop: "fill", gravity: "auto" }],
      });
      src = upload.secure_url;
    }

    const doc  = await ref.get();
    const list = doc.exists ? doc.data().list || [] : [];
    const newInspo = {
      id: Date.now(),
      title, category, src,
      autoServices, autoAddons, autoLength,
      placeholder: "linear-gradient(135deg, #f8b7d1, #ff6ec4)",
    };
    await ref.set({ list: [...list, newInspo] });
    return res.status(200).json({ inspo: newInspo });
  }

  // DELETE
  if (req.method === "DELETE") {
    const { id } = req.query;
    const doc  = await ref.get();
    const list = doc.exists ? doc.data().list || [] : [];
    await ref.set({ list: list.filter(i => String(i.id) !== String(id)) });
    return res.status(200).json({ ok: true });
  }

  // PATCH — reorder (drag n drop)
  if (req.method === "PATCH") {
    const { list } = req.body;
    await ref.set({ list });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
