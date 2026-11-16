// Server-only security helpers: admin sessions, rate limiting, escaping, validation.
import crypto from "crypto";
import { parse, serialize } from "cookie";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

// ── Admin session ─────────────────────────────────────────────
// The cookie holds "<expiry>.<hmac>". It can't be forged without the secret.
// SESSION_SECRET is preferred; if it's missing we derive one from ADMIN_PASSWORD,
// so changing the password also logs out every existing session.
function sessionSecret() {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 32) return explicit;
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return crypto.createHash("sha256").update(`pavnailedit-session:${pw}`).digest("hex");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) {
    crypto.timingSafeEqual(ba, ba); // keep timing roughly constant
    return false;
  }
  return crypto.timingSafeEqual(ba, bb);
}

export function checkAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string") return false;
  // Compare hashes so the length of the real password isn't leaked.
  const h = (s) => crypto.createHash("sha256").update(s).digest("hex");
  return safeEqual(h(password), h(expected));
}

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
    path: "/",
  };
}

export function createSessionCookie() {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD or SESSION_SECRET must be set");
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS);
  return serialize(SESSION_COOKIE, `${exp}.${sign(exp, secret)}`, cookieOptions(SESSION_TTL_SECONDS));
}

export function clearSessionCookie() {
  return serialize(SESSION_COOKIE, "", cookieOptions(0));
}

export function isAdmin(req) {
  const secret = sessionSecret();
  if (!secret) return false;
  const raw = parse(req.headers.cookie || "")[SESSION_COOKIE];
  if (!raw) return false;
  const [exp, mac] = raw.split(".");
  if (!exp || !mac) return false;
  if (!safeEqual(mac, sign(exp, secret))) return false;
  return Number(exp) > Math.floor(Date.now() / 1000);
}

/** Returns true when the request may continue; otherwise it has already responded 401. */
export function requireAdmin(req, res) {
  if (isAdmin(req)) return true;
  res.status(401).json({ error: "Unauthorized" });
  return false;
}

// ── Rate limiting ─────────────────────────────────────────────
// In-memory, per server instance. On Vercel this is best-effort (each cold
// instance has its own memory) but it stops casual brute force and spam.
const buckets = new Map();

export function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

/**
 * Returns true if allowed. When blocked it responds 429 itself.
 * key: logical bucket name, limit: max hits, windowMs: window length.
 */
export function rateLimit(req, res, key, limit, windowMs) {
  const now = Date.now();
  const id = `${key}:${clientIp(req)}`;
  let entry = buckets.get(id);
  if (!entry || entry.reset <= now) {
    entry = { count: 0, reset: now + windowMs };
    buckets.set(id, entry);
  }
  entry.count += 1;
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
  }
  if (entry.count > limit) {
    res.setHeader("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
    res.status(429).json({ error: "Твърде много опити. Опитай пак след малко." });
    return false;
  }
  return true;
}

// ── Escaping & validation ────────────────────────────────────
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;
export const PHONE_RE = /^\+?[0-9 ()\-]{6,20}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Trim and cap a free-text field. Returns "" for non-strings. */
export function cleanText(value, max = 100) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

// ── Booking cancel tokens ────────────────────────────────────
export function newCancelToken() {
  const token = crypto.randomBytes(24).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function tokenMatches(token, hash) {
  if (!token || !hash) return false;
  return safeEqual(hashToken(token), hash);
}

export function siteUrl() {
  return (process.env.SITE_URL || "https://pavnailed.it").replace(/\/$/, "");
}
