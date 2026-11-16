// Shared booking rules — imported by both the booking page and the API,
// so prices, slots and blocked days can never drift apart.

export const SERVICES = [
  { name: "Гел - къси нокти",  price: 18,                art: "gel-short" },
  { name: "Гел - дълги нокти", price: 20,                art: "gel-long" },
  { name: "Изграждане",        price: 35,                art: "extensions" },
  { name: "1 нокът",           price: 1.50, countable: true, max: 5, art: "single-nail" },
  { name: "Френски",           price: 2,                 art: "french" },
  { name: "Камъни",            price: 0.2, countable: true, max: 500, art: "rhinestone" },
  { name: "Стикери",           price: 1,                 art: "sticker" },
  { name: "Буква",             price: 1,                 art: "letter" },
  { name: "Сребърно/златно",   price: 2,                 art: "foil" },
];

export const ADDONS = [
  { name: "3D цветя",           price: 4, countable: true, max: 4, art: "3d-flower" },
  { name: "3D линии",           price: 4,                art: "3d-lines" },
  { name: "Blooming gel",       price: 3,                art: "blooming-gel" },
  { name: "Blooming gel цвете", price: 4,                art: "blooming-flower" },
  { name: "Панделка",           price: 2, countable: true, max: 4, art: "bow" },
  { name: "Аура",               price: 3.5,              art: "aura" },
  { name: "Омбре",              price: 3.5,              art: "ombre" },
  { name: "Бяло омбре",         price: 4,                art: "white-ombre" },
  { name: "Животински дизайн",  price: 3,                art: "animal-print" },
];

export const ALL_ITEMS = [...SERVICES, ...ADDONS];

export const NAIL_LENGTH_PRICES = { short: 0, medium: 2.5, long: 5, xlong: 7.5 };

export const TIMES = ["10:00", "14:00", "16:30"];
export const MIN_DAYS_AHEAD = 3;
export const MAX_ACTIVE_BOOKINGS = 3;

const HOLIDAYS = ["01.01.2025","03.03.2025","01.05.2025","06.05.2025","24.05.2025","06.09.2025","22.09.2025","24.12.2026","25.12.2026","26.12.2026"];

// Specific dates when the studio is closed
const BLOCKED_DATES = ["17.10.2026","18.10.2026","31.10.2026","01.11.2026","11.11.2026","18.11.2026"];

export const DATE_RE = /^\d{2}\.\d{2}\.\d{4}$/;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const toDateStr = (date) => {
  const dd = date.getDate().toString().padStart(2, "0");
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${dd}.${mm}.${date.getFullYear()}`;
};

export function strToDate(dateStr) {
  const [d, m, y] = dateStr.split(".").map(Number);
  return new Date(y, m - 1, d);
}

/** true when "dd.mm.yyyy" is a real calendar date */
export function isValidDateStr(dateStr) {
  if (typeof dateStr !== "string" || !DATE_RE.test(dateStr)) return false;
  const [d, m, y] = dateStr.split(".").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** true = the day is closed for booking */
export function isDateBlocked(date) {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0 = Jan
  const dow = date.getDay(); // 0 = Sun
  if (BLOCKED_DATES.includes(toDateStr(date))) return true;
  if (y === 2026 && m === 9) return true;                 // all of October 2026
  if (y === 2026 && m === 11 && dow === 1) return true;   // every Monday in December 2026
  return false;
}

/** Which time slots exist on a given day */
export function getSlotsForDate(date) {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return ["14:00", "16:30"];                       // weekend
  if (HOLIDAYS.includes(toDateStr(date))) return ["10:00", "14:00", "16:30"];   // public holiday
  // November 2026 (except the 30th): weekdays only 10:00
  if (date.getFullYear() === 2026 && date.getMonth() === 10 && date.getDate() !== 30) return ["10:00"];
  return ["16:30"];                                                             // weekday
}

/** breaks are stored as { start: "YYYY-MM-DD", end: "YYYY-MM-DD" } */
export function isInBreak(date, breaks = []) {
  return breaks.some(b => {
    const from = new Date(b.start + "T00:00:00");
    const to   = new Date(b.end   + "T00:00:00");
    return date >= from && date <= to;
  });
}

/** Today's date in Sofia as a local-midnight Date (server runs in UTC). */
export function todayInSofia() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sofia", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => Number(parts.find(p => p.type === t).value);
  return new Date(get("year"), get("month") - 1, get("day"));
}

export function earliestBookableDate() {
  const d = todayInSofia();
  d.setDate(d.getDate() + MIN_DAYS_AHEAD);
  return d;
}

/**
 * Normalise a { name: count } selection against the catalogue.
 * Returns { items: [{name, count, price}], error }.
 */
export function normaliseSelection(selection) {
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) {
    return { items: [], error: "Невалидни услуги" };
  }
  const items = [];
  for (const [name, rawCount] of Object.entries(selection)) {
    const svc = ALL_ITEMS.find(s => s.name === name);
    if (!svc) return { items: [], error: `Непозната услуга: ${String(name).slice(0, 40)}` };
    const count = Number(rawCount);
    if (!Number.isInteger(count) || count < 1) return { items: [], error: "Невалидно количество" };
    if (!svc.countable && count !== 1) return { items: [], error: "Невалидно количество" };
    if (svc.countable && count > svc.max) return { items: [], error: "Невалидно количество" };
    items.push({ name, count, price: svc.price });
  }
  return { items, error: null };
}

// ── Combination rules ─────────────────────────────────────────
// Gel comes in two variants that must match the chosen nail length; only one
// gel variant at a time. Extensions (Изграждане) can be combined with gel.
export const GEL_SHORT = "Гел - къси нокти";
export const GEL_LONG = "Гел - дълги нокти";
export const EXTENSIONS = "Изграждане";
export const SINGLE_NAIL = "1 нокът";
export const BASE_SERVICES = [GEL_SHORT, GEL_LONG, EXTENSIONS];
const SHORT_LENGTHS = ["short", "medium"];

/** Which gel variant a nail length requires. */
export function gelForLength(length) {
  if (!length) return null;
  return SHORT_LENGTHS.includes(length) ? GEL_SHORT : GEL_LONG;
}

/** A sensible default length for a gel variant when none is chosen yet. */
export function defaultLengthForGel(gel) {
  return gel === GEL_LONG ? "long" : "short";
}

/**
 * Bring a { name: count } selection into a consistent state:
 * - at most one gel variant (the most recently chosen one wins: `prefer`)
 * - the gel variant always matches the nail length
 * Extensions may stay alongside gel. Returns a NEW object; never mutates the input.
 */
export function reconcileSelection(selection, nailLength, prefer = null) {
  const next = { ...selection };
  if (next[GEL_SHORT] && next[GEL_LONG]) {
    const keep = prefer === GEL_SHORT || prefer === GEL_LONG ? prefer : GEL_LONG;
    delete next[keep === GEL_SHORT ? GEL_LONG : GEL_SHORT];
  }
  const wantGel = gelForLength(nailLength);
  if (wantGel && (next[GEL_SHORT] || next[GEL_LONG]) && !next[wantGel]) {
    delete next[GEL_SHORT];
    delete next[GEL_LONG];
    next[wantGel] = 1;
  }
  return next;
}

/** Server/client validation of the combination. Returns an error string or null. */
export function validateCombination(items, nailLength) {
  const names = items.map(i => i.name);
  const bases = names.filter(n => BASE_SERVICES.includes(n));
  if (names.includes(GEL_SHORT) && names.includes(GEL_LONG)) {
    return "Избери само един вид гел — за къси или за дълги нокти.";
  }
  if (bases.length === 0 && !names.includes(SINGLE_NAIL)) {
    return "Избери основна услуга — гел или изграждане.";
  }
  if (bases.length > 0 && !nailLength) return "Избери дължина на ноктите.";
  const gel = bases.find(b => b === GEL_SHORT || b === GEL_LONG);
  if (gel && nailLength && gelForLength(nailLength) !== gel) {
    return gel === GEL_LONG
      ? "„Гел - дълги нокти“ е за дълги нокти — избери дълга дължина или гел за къси нокти."
      : "„Гел - къси нокти“ е за къси нокти — избери къса дължина или гел за дълги нокти.";
  }
  return null;
}

/** Price before any gift card. */
export function computeSubtotal(items, nailLength) {
  const services = items.reduce((sum, i) => sum + i.price * i.count, 0);
  const length = nailLength ? (NAIL_LENGTH_PRICES[nailLength] || 0) : 0;
  return Math.round((services + length) * 100) / 100;
}

/** Human-readable list, e.g. ["Камъни ×12", "Френски"] */
export function describeItems(items) {
  return items.map(i => (i.count > 1 ? `${i.name} ×${i.count}` : i.name));
}
