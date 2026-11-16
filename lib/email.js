import nodemailer from "nodemailer";
import { escapeHtml as e, siteUrl } from "./security";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "pavlina.dochevaas@gmail.com";
const INSTAGRAM_URL = "https://instagram.com/pav.nailed.it";
const INSTAGRAM_HANDLE = "@pav.nailed.it";

export function createTransporter() {
  // Gmail app passwords are shown with spaces ("abcd efgh ijkl mnop") — strip them,
  // otherwise Gmail rejects the login with 535-5.7.8 BadCredentials.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!pass) throw new Error("Missing GMAIL_APP_PASSWORD env var");
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER || OWNER_EMAIL, pass },
  });
}

const FROM = () => `"PavNailedIt 💅" <${process.env.GMAIL_USER || OWNER_EMAIL}>`;

const NAIL_LENGTH_LABELS = {
  short:  "Къси (0–2 mm) — Базова цена",
  medium: "Средни (3–4 mm) — +2.5€",
  long:   "Дълги (5–7 mm) — +5€",
  xlong:  "X-Дълги (8–10 mm) — +7.5€",
};

const list = (services) => e(Array.isArray(services) ? services.join(", ") : services);

function cancelLink(id, token) {
  if (!id || !token) return "";
  const url = `${siteUrl()}/already-booked?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;
  return `
    <p style="font-size:0.85rem;color:#8a5a72;text-align:center;margin-top:16px;">
      Нужно е да отмениш? <a href="${e(url)}" style="color:#c2185b;font-weight:700;">Отмени резервацията</a>
    </p>`;
}

async function send(options) {
  await createTransporter().sendMail({ from: FROM(), ...options });
}

export async function sendClientConfirmation({ id, cancelToken, name, email, date, time, services, totalPrice, designUrl, nailLength, discount }) {
  const lengthLabel = nailLength ? NAIL_LENGTH_LABELS[nailLength] : "Не е избрана";
  await send({
    to: email,
    subject: `✅ Потвърждение на час – ${date} в ${time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#f8b7d1,#ff6ec4);padding:28px 32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:1.5rem;">💅 Часът е запазен!</h1>
        </div>
        <div style="padding:28px 32px;color:#555;line-height:1.7;">
          <p>Здравей, <strong>${e(name)}</strong>! 🌸</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px 0;color:#777;width:40%;">📅 Дата</td><td><strong>${e(date)}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#777;">🕐 Час</td><td><strong>${e(time)}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#777;">💅 Дължина</td><td><strong>${e(lengthLabel)}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#777;">✨ Услуги</td><td>${list(services)}</td></tr>
            ${discount ? `<tr><td style="padding:8px 0;color:#777;">🎁 Подаръчна карта</td><td>−${e(discount)} €</td></tr>` : ""}
            <tr><td style="padding:8px 0;color:#777;">💰 Цена</td><td><strong>${e(totalPrice)} €</strong></td></tr>
          </table>
          <div style="background:#fff5f9;padding:12px 16px;border-radius:8px;margin:16px 0;font-size:0.9rem;">
            ⏰ <strong>Важно:</strong> При закъснение от 10 мин → доплащане 5€. При 20+ мин → часът се отменя без възстановяване.
          </div>
          ${designUrl ? `<p>🖼️ <a href="${e(designUrl)}" style="color:#c2185b;">Виж качения дизайн</a></p>` : ""}
          <div style="text-align:center;margin:20px 0;padding:14px;background:linear-gradient(135deg,#fdf5ee,#fde8d8);border-radius:14px;">
            <p style="margin:0 0 6px;font-size:0.85rem;color:#7a5a48;">Как да се грижиш за маникюра:</p>
            <a href="${siteUrl()}/aftercare" style="color:#9c6a45;font-weight:700;font-size:0.9rem;">💅 Наръчник за грижа за ноктите →</a>
          </div>
          ${cancelLink(id, cancelToken)}
          <p>До скоро! 💖<br><strong>Павлина — PavNailedIt</strong></p>
        </div>
      </div>`,
  });
}

export async function sendOwnerNotification({ name, email, phone, date, time, services, totalPrice, designUrl, nailLength, giftCode, discount }) {
  const lengthLabel = nailLength ? NAIL_LENGTH_LABELS[nailLength] : "Не е избрана";
  await send({
    to: OWNER_EMAIL,
    subject: `💅 Нова резервация – ${name} на ${date} в ${time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
        <h2 style="color:#c2185b;">Нова резервация 💅</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#777;width:35%;">Клиент</td><td><strong>${e(name)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#777;">Имейл</td><td>${e(email)}</td></tr>
          <tr><td style="padding:6px 0;color:#777;">Телефон</td><td>${e(phone)}</td></tr>
          <tr><td style="padding:6px 0;color:#777;">Дата</td><td><strong>${e(date)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#777;">Час</td><td><strong>${e(time)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#777;">💅 Дължина</td><td><strong>${e(lengthLabel)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#777;">Услуги</td><td>${list(services)}</td></tr>
          ${giftCode ? `<tr><td style="padding:6px 0;color:#777;">Подаръчна карта</td><td>${e(giftCode)} (−${e(discount)} €)</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#777;">Цена</td><td><strong>${e(totalPrice)} €</strong></td></tr>
        </table>
        ${designUrl ? `<p><a href="${e(designUrl)}" style="color:#c2185b;">🖼️ Виж дизайна</a></p>` : "<p>Без дизайн изображение</p>"}
      </div>`,
  });
}

export async function sendCancellationEmail({ name, email, date, time }) {
  await send({
    to: email,
    subject: `❌ Отменен час – ${date} в ${time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
        <h2 style="color:#c2185b;">Часът е отменен</h2>
        <p>Здравей, <strong>${e(name)}</strong>!</p>
        <p>Твоят час на <strong>${e(date)}</strong> в <strong>${e(time)}</strong> беше отменен.</p>
        <p>За нов час: <a href="${siteUrl()}/book" style="color:#c2185b;">${siteUrl().replace(/^https?:\/\//, "")}/book</a>
        или пиши в <a href="${INSTAGRAM_URL}" style="color:#c2185b;">${INSTAGRAM_HANDLE}</a></p>
        <p>💖 Павлина</p>
      </div>`,
  });
}

export async function sendOwnerCancellationNotice({ name, date, time, byClient }) {
  await send({
    to: OWNER_EMAIL,
    subject: `❌ Отменена резервация – ${name} на ${date} в ${time}`,
    html: `<p><strong>${e(name)}</strong> ${byClient ? "отмени" : "беше отменен(а)"} часа си на <strong>${e(date)}</strong> в <strong>${e(time)}</strong>.</p>`,
  });
}

export async function sendRescheduleEmail({ name, email, oldDate, oldTime, newDate, newTime }) {
  await send({
    to: email,
    subject: `📅 Твоят час е преместен – ${newDate} в ${newTime}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
        <h2 style="color:#c2185b;">Часът е преместен</h2>
        <p>Здравей, <strong>${e(name)}</strong>!</p>
        <p>Стар час: ${e(oldDate)} ${e(oldTime)}<br>Нов час: <strong>${e(newDate)} ${e(newTime)}</strong></p>
        <p>Ако новият час не ти е удобен, пиши в <a href="${INSTAGRAM_URL}" style="color:#c2185b;">${INSTAGRAM_HANDLE}</a>.</p>
        <p>💖 Павлина</p>
      </div>`,
  });
}

export async function sendWaitlistEmail({ name, email, date, time }) {
  await send({
    to: email,
    subject: `🎉 Освободи се час – ${date} в ${time}!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#f8b7d1,#ff6ec4);padding:28px 32px;text-align:center;">
          <div style="font-size:2.5rem;margin-bottom:8px;">🎉</div>
          <h1 style="color:#fff;margin:0;font-size:1.4rem;">Освободи се час!</h1>
        </div>
        <div style="padding:28px 32px;color:#555;line-height:1.7;">
          <p>Здравей, <strong>${e(name)}</strong>! 💖</p>
          <p>Беше в чакащия списък и се освободи час:</p>
          <div style="background:linear-gradient(135deg,#fff5fb,#ffe8f4);border-radius:14px;padding:18px 20px;margin:16px 0;text-align:center;">
            <div style="font-size:1.5rem;font-weight:800;color:#c2185b;">${e(date)}</div>
            <div style="font-size:1.1rem;color:#8a5a72;">в ${e(time)}</div>
          </div>
          <p>Побързай — часовете се вземат бързо! 🌸</p>
          <div style="text-align:center;margin-top:24px;">
            <a href="${siteUrl()}/book" style="display:inline-block;background:#c2185b;color:#fff;padding:14px 32px;border-radius:50px;font-weight:700;text-decoration:none;font-size:1rem;">
              Запази час сега →
            </a>
          </div>
          <p style="margin-top:24px;font-size:0.85rem;color:#777;">
            Ако не успееш да запазиш, ще уведомим следващия в списъка.
          </p>
          <p>До скоро! 💖<br><strong>Павлина — PavNailedIt</strong></p>
        </div>
      </div>`,
  });
}

export async function sendReminderToClient({ name, email, date, time, services, totalPrice, nailLength }) {
  const lengthLabel = nailLength ? NAIL_LENGTH_LABELS[nailLength] : null;
  await send({
    to: email,
    subject: `⏰ Напомняне за утрешния ти час – ${time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#f8b7d1,#ff6ec4);padding:28px 32px;text-align:center;">
          <div style="font-size:2.5rem;margin-bottom:8px;">💅</div>
          <h1 style="color:#fff;margin:0;font-size:1.4rem;">До утре!</h1>
          <p style="color:rgba(255,255,255,0.95);margin:6px 0 0;font-size:0.95rem;">Не забравяй за своя час 🌸</p>
        </div>
        <div style="padding:28px 32px;color:#555;line-height:1.7;">
          <p>Здравей, <strong>${e(name)}</strong>! 💖</p>
          <p>Напомняме ти, че утре те чакаме:</p>
          <div style="background:linear-gradient(135deg,#fff5fb,#ffe8f4);border-radius:14px;padding:18px 20px;margin:16px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:7px 0;color:#8a5a72;width:40%;">📅 Дата</td><td><strong>${e(date)}</strong></td></tr>
              <tr><td style="padding:7px 0;color:#8a5a72;">🕐 Час</td><td><strong style="font-size:1.1rem;color:#c2185b;">${e(time)}</strong></td></tr>
              ${lengthLabel ? `<tr><td style="padding:7px 0;color:#8a5a72;">💅 Дължина</td><td>${e(lengthLabel)}</td></tr>` : ""}
              <tr><td style="padding:7px 0;color:#8a5a72;">✨ Услуги</td><td>${list(services)}</td></tr>
              <tr><td style="padding:7px 0;color:#8a5a72;">💰 Цена</td><td><strong>${e(totalPrice)} €</strong></td></tr>
            </table>
          </div>
          <div style="background:#fff0f5;padding:12px 16px;border-radius:8px;margin:16px 0;font-size:0.88rem;color:#666;">
            ⚠️ <strong>Помни:</strong> Закъснение от 10 мин → доплащане 5€. Над 20 мин → часът се отменя без възстановяване.
          </div>
          <div style="text-align:center;margin-top:24px;padding:16px;background:linear-gradient(135deg,#fff5fb,#ffe8f4);border-radius:14px;">
            <p style="margin:0 0 4px;font-size:0.85rem;color:#8a5a72;">Нужно е да отмениш?</p>
            <p style="margin:0;font-size:0.85rem;">Пиши ни в <a href="${INSTAGRAM_URL}" style="color:#c2185b;font-weight:700;">${INSTAGRAM_HANDLE}</a></p>
          </div>
          <p style="margin-top:24px;">До утре! 💖<br><strong>Павлина — PavNailedIt</strong></p>
        </div>
      </div>`,
  });
}

export async function sendDailySummaryToOwner({ date, bookings }) {
  const totalRevenue = bookings.reduce((s, b) => s + (parseFloat(b.totalPrice) || 0), 0).toFixed(2);
  const rows = bookings.map(b => `
    <tr style="border-bottom:1px solid #fde8f0;">
      <td style="padding:10px 8px;"><strong>${e(b.time)}</strong></td>
      <td style="padding:10px 8px;">${e(b.name)}</td>
      <td style="padding:10px 8px;color:#777;font-size:0.85rem;">${list(b.services)}</td>
      <td style="padding:10px 8px;text-align:right;color:#c2185b;font-weight:700;">${e(b.totalPrice)}€</td>
    </tr>`).join("");

  await send({
    to: OWNER_EMAIL,
    subject: `📅 Програма за утре – ${date} (${bookings.length} клиент${bookings.length === 1 ? "" : "ки"})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#f8b7d1,#ff6ec4);padding:24px 28px;">
          <h1 style="color:#fff;margin:0;font-size:1.3rem;">📅 Твоята програма за утре</h1>
          <p style="color:rgba(255,255,255,0.95);margin:6px 0 0;">${e(date)}</p>
        </div>
        <div style="padding:24px 28px;">
          <p style="margin:0 0 16px;"><strong>${bookings.length}</strong> клиентки · очакван приход <strong>${totalRevenue}€</strong></p>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#fdf0f7;">
                <th style="padding:8px;text-align:left;font-size:0.75rem;color:#8a5a72;">Час</th>
                <th style="padding:8px;text-align:left;font-size:0.75rem;color:#8a5a72;">Клиент</th>
                <th style="padding:8px;text-align:left;font-size:0.75rem;color:#8a5a72;">Услуги</th>
                <th style="padding:8px;text-align:right;font-size:0.75rem;color:#8a5a72;">Цена</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin-top:20px;color:#777;font-size:0.85rem;">Имат имейл и ще получат напомняне: ${bookings.filter(b => b.clientEmail).length} от ${bookings.length}</p>
        </div>
      </div>`,
  });
}
