import { checkAdminPassword, createSessionCookie, rateLimit } from "../../../lib/security";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }
  // 5 attempts per 15 minutes per IP
  if (!rateLimit(req, res, "admin-login", 5, 15 * 60 * 1000)) return;

  if (!process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is not set — admin login is disabled.");
    return res.status(503).json({ error: "Admin login is not configured" });
  }

  const { password } = req.body || {};
  if (!checkAdminPassword(password)) {
    return res.status(401).json({ error: "Wrong password" });
  }

  res.setHeader("Set-Cookie", createSessionCookie());
  return res.status(200).json({ ok: true });
}
