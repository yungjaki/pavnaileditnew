import { serialize } from "cookie";

export default function handler(req, res) {
  const cookie = serialize("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
}
