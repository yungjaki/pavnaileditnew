import formidable from "formidable";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { settingsDoc } from "../../../lib/firebase";
import { requireAdmin, cleanText } from "../../../lib/security";
import { SERVICES, ADDONS, NAIL_LENGTH_PRICES } from "../../../lib/bookingRules";

export const config = { api: { bodyParser: false } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CATEGORIES = ["ombre", "3d", "aura", "minimal", "cute", "art"];
const SERVICE_NAMES = SERVICES.map(s => s.name);
const ADDON_NAMES = ADDONS.map(s => s.name);

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 100_000) reject(new Error("Body too large"));
    });
    req.on("end", () => { try { resolve(JSON.parse(body || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

function pickList(raw, allowed) {
  try {
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr.filter(x => allowed.includes(x)) : [];
  } catch { return []; }
}

export default async function handler(req, res) {
  // Check admin before touching the database for anything but the public GET.
  if (req.method !== "GET" && !requireAdmin(req, res)) return;
  let ref;

  try {
    ref = settingsDoc("inspos");
    // Public GET — the booking page shows these
    if (req.method === "GET") {
      const doc = await ref.get();
      return res.status(200).json({ inspos: doc.exists ? doc.data().list || [] : [] });
    }

    // POST — upload a new inspo (image required)
    if (req.method === "POST") {
      const form = formidable({
        maxFiles: 1,
        maxFileSize: 8 * 1024 * 1024,
        maxFields: 10,
        filter: ({ mimetype }) => Boolean(mimetype && mimetype.startsWith("image/")),
      });
      const [fields, files] = await form.parse(req);
      const f = (k) => fields[k]?.[0];
      const file = files.image?.[0];
      if (!file) return res.status(400).json({ error: "Нужна е снимка (JPG, PNG, WEBP, до 8 MB)" });

      let src;
      try {
        const upload = await cloudinary.uploader.upload(file.filepath, {
          folder: "pavnailedit/inspos",
          resource_type: "image",
          transformation: [{ width: 600, height: 800, crop: "fill", gravity: "auto" }],
        });
        src = upload.secure_url;
      } finally {
        try { fs.unlinkSync(file.filepath); } catch {}
      }

      const category = CATEGORIES.includes(f("category")) ? f("category") : "art";
      const autoLength = f("autoLength") in NAIL_LENGTH_PRICES ? f("autoLength") : "medium";
      const newInspo = {
        id: Date.now(),
        title: cleanText(f("title"), 60) || "Без заглавие",
        category, src, autoLength,
        autoServices: pickList(f("autoServices"), SERVICE_NAMES),
        autoAddons: pickList(f("autoAddons"), ADDON_NAMES),
      };
      const doc = await ref.get();
      const list = doc.exists ? doc.data().list || [] : [];
      await ref.set({ list: [...list, newInspo] });
      return res.status(200).json({ inspo: newInspo });
    }

    // DELETE
    if (req.method === "DELETE") {
      const id = cleanText(req.query.id, 32);
      const doc = await ref.get();
      const list = doc.exists ? doc.data().list || [] : [];
      await ref.set({ list: list.filter(i => String(i.id) !== String(id)) });
      return res.status(200).json({ ok: true });
    }

    // PATCH — reorder: body { ids: [...] } with the existing ids in the new order
    if (req.method === "PATCH") {
      const { ids } = await readJson(req);
      if (!Array.isArray(ids)) return res.status(400).json({ error: "ids must be an array" });
      const doc = await ref.get();
      const list = doc.exists ? doc.data().list || [] : [];
      const byId = new Map(list.map(i => [String(i.id), i]));
      const reordered = ids.map(id => byId.get(String(id))).filter(Boolean);
      // Keep anything the client didn't mention, so nothing is ever lost.
      const rest = list.filter(i => !ids.map(String).includes(String(i.id)));
      await ref.set({ list: [...reordered, ...rest] });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Inspos error:", err);
    return res.status(500).json({ error: "Грешка при обработката" });
  }
}
