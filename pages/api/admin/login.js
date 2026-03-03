// Simple password-based admin auth using a secure cookie
import { serialize } from "cookie";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Pp240408";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password" });
  }

  // Set a simple session cookie (httpOnly, 8 hour expiry)
  const cookie = serialize("admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
}
