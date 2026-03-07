import nodemailer from "nodemailer";

function createTransporter() {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) throw new Error("Missing GMAIL_APP_PASSWORD env var");
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: "pavlina.dochevaas@gmail.com", pass },
  });
}

const FROM = `"PavNailedIt 💅" <pavlina.dochevaas@gmail.com>`;

const NAIL_LENGTH_LABELS = {
  short:  "Къси (0–2 mm) — Базова цена",
  medium: "Средни (3–4 mm) — +2.5€",
  long:   "Дълги (5–7 mm) — +5€",
  xlong:  "X-Дълги (8–10 mm) — +7.5€",
};

export async function sendClientConfirmation({ name, email, date, time, services, totalPrice, designUrl, nailLength }) {
  const lengthLabel = nailLength ? NAIL_LENGTH_LABELS[nailLength] : "Не е избрана";
  await createTransporter().sendMail({
    from: FROM,
    to: email,
    subject: `✅ Потвърждение на час – ${date} в ${time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#f8b7d1,#ff6ec4);padding:28px 32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:1.5rem;">💅 Часът е запазен!</h1>
        </div>
        <div style="padding:28px 32px;color:#555;line-height:1.7;">
          <p>Здравей, <strong>${name}</strong>! 🌸</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px 0;color:#999;width:40%;">📅 Дата</td><td><strong>${date}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#999;">🕐 Час</td><td><strong>${time}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#999;">💅 Дължина</td><td><strong>${lengthLabel}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#999;">✨ Услуги</td><td>${Array.isArray(services) ? services.join(", ") : services}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">💰 Цена</td><td><strong>${totalPrice} €</strong></td></tr>
          </table>
          <div style="background:#fff5f9;border-left:3px solid #ff6ec4;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;font-size:0.9rem;">
            ⏰ <strong>Важно:</strong> При закъснение над 15 мин → +2€. При 20+ мин → часът се отменя.
          </div>
          ${designUrl ? `<p>🖼️ <a href="${designUrl}" style="color:#ff6ec4;">Виж качения дизайн</a></p>` : ""}
          <p>До скоро! 💖<br><strong>Павлина — PavNailedIt</strong></p>
        </div>
      </div>`,
  });
}

export async function sendOwnerNotification({ name, email, phone, date, time, services, totalPrice, designUrl, nailLength }) {
  const lengthLabel = nailLength ? NAIL_LENGTH_LABELS[nailLength] : "Не е избрана";
  await createTransporter().sendMail({
    from: FROM,
    to: "pavlina.dochevaas@gmail.com",
    subject: `💅 Нова резервация – ${name} на ${date} в ${time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
        <h2 style="color:#ff6ec4;">Нова резервация 💅</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#999;width:35%;">Клиент</td><td><strong>${name}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#999;">Имейл</td><td>${email}</td></tr>
          <tr><td style="padding:6px 0;color:#999;">Телефон</td><td>${phone}</td></tr>
          <tr><td style="padding:6px 0;color:#999;">Дата</td><td><strong>${date}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#999;">Час</td><td><strong>${time}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#999;">💅 Дължина</td><td><strong>${lengthLabel}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#999;">Услуги</td><td>${Array.isArray(services) ? services.join(", ") : services}</td></tr>
          <tr><td style="padding:6px 0;color:#999;">Цена</td><td><strong>${totalPrice} €</strong></td></tr>
        </table>
        ${designUrl ? `<p><a href="${designUrl}" style="color:#ff6ec4;">🖼️ Виж дизайна</a></p>` : "<p>Без дизайн изображение</p>"}
      </div>`,
  });
}

export async function sendCancellationEmail({ name, email, date, time }) {
  await createTransporter().sendMail({
    from: FROM,
    to: email,
    subject: `❌ Отменен час – ${date} в ${time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
        <h2 style="color:#ff6ec4;">Часът е отменен</h2>
        <p>Здравей, <strong>${name}</strong>!</p>
        <p>Твоят час на <strong>${date}</strong> в <strong>${time}</strong> беше отменен.</p>
        <p>За ново записване: <a href="https://instagram.com/pavnailedit" style="color:#ff6ec4;">@pavnailedit</a></p>
        <p>💖 Павлина</p>
      </div>`,
  });
}

export async function sendReminderToClient({ name, email, date, time, services, totalPrice, nailLength }) {
  const lengthLabel = nailLength ? NAIL_LENGTH_LABELS[nailLength] : null;
  await createTransporter().sendMail({
    from: FROM,
    to: email,
    subject: `⏰ Напомняне за утрешния ти час – ${time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#f8b7d1,#ff6ec4);padding:28px 32px;text-align:center;">
          <div style="font-size:2.5rem;margin-bottom:8px;">💅</div>
          <h1 style="color:#fff;margin:0;font-size:1.4rem;">До утре!</h1>
          <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:0.95rem;">Не забравяй за своя час 🌸</p>
        </div>
        <div style="padding:28px 32px;color:#555;line-height:1.7;">
          <p>Здравей, <strong>${name}</strong>! 💖</p>
          <p>Напомняме ти, че утре те чакаме:</p>
          <div style="background:linear-gradient(135deg,#fff5fb,#ffe8f4);border-radius:14px;padding:18px 20px;margin:16px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:7px 0;color:#c994b0;width:40%;">📅 Дата</td><td><strong>${date}</strong></td></tr>
              <tr><td style="padding:7px 0;color:#c994b0;">🕐 Час</td><td><strong style="font-size:1.1rem;color:#e0559e;">${time}</strong></td></tr>
              ${lengthLabel ? `<tr><td style="padding:7px 0;color:#c994b0;">💅 Дължина</td><td>${lengthLabel}</td></tr>` : ""}
              <tr><td style="padding:7px 0;color:#c994b0;">✨ Услуги</td><td>${Array.isArray(services) ? services.join(", ") : services}</td></tr>
              <tr><td style="padding:7px 0;color:#c994b0;">💰 Цена</td><td><strong>${totalPrice} €</strong></td></tr>
            </table>
          </div>
          <div style="background:#fff0f5;border-left:3px solid #ff6ec4;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;font-size:0.88rem;color:#888;">
            ⚠️ <strong>Помни:</strong> Закъснение над 15 мин → +2€. Над 20 мин → часът се отменя.
          </div>
          <div style="text-align:center;margin-top:24px;padding:16px;background:linear-gradient(135deg,#fff5fb,#ffe8f4);border-radius:14px;">
            <p style="margin:0 0 4px;font-size:0.85rem;color:#c994b0;">Нужно е да отмениш?</p>
            <p style="margin:0;font-size:0.85rem;">Пиши ни в <a href="https://instagram.com/pavnailedit" style="color:#ff6ec4;font-weight:700;">@pavnailedit</a></p>
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
      <td style="padding:10px 8px;"><strong>${b.time}</strong></td>
      <td style="padding:10px 8px;">${b.name}</td>
      <td style="padding:10px 8px;color:#888;font-size:0.85rem;">${Array.isArray(b.services) ? b.services.join(", ") : b.services}</td>
      <td style="padding:10px 8px;text-align:right;color:#e0559e;font-weight:700;">${b.totalPrice}€</td>
    </tr>`).join("");

  await createTransporter().sendMail({
    from: FROM,
    to:   "pavlina.dochevaas@gmail.com",
    subject: `📅 Програма за утре – ${date} (${bookings.length} клиент${bookings.length === 1 ? "" : "ки"})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#f8b7d1,#ff6ec4);padding:24px 28px;">
          <h1 style="color:#fff;margin:0;font-size:1.3rem;">📅 Твоята програма за утре</h1>
          <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;">${date}</p>
        </div>
        <div style="padding:24px 28px;">
          <div style="display:flex;gap:16px;margin-bottom:24px;">
            <div style="flex:1;background:linear-gradient(135deg,#fff5fb,#ffe8f4);border-radius:12px;padding:14px;text-align:center;">
              <div style="font-size:1.8rem;font-weight:800;color:#e0559e;">${bookings.length}</div>
              <div style="font-size:0.75rem;color:#c994b0;text-transform:uppercase;letter-spacing:1px;">Клиентки</div>
            </div>
            <div style="flex:1;background:linear-gradient(135deg,#fff5fb,#ffe8f4);border-radius:12px;padding:14px;text-align:center;">
              <div style="font-size:1.8rem;font-weight:800;color:#e0559e;">${totalRevenue}€</div>
              <div style="font-size:0.75rem;color:#c994b0;text-transform:uppercase;letter-spacing:1px;">Очакван приход</div>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#fdf0f7;">
                <th style="padding:8px;text-align:left;font-size:0.75rem;color:#c994b0;text-transform:uppercase;letter-spacing:1px;">Час</th>
                <th style="padding:8px;text-align:left;font-size:0.75rem;color:#c994b0;text-transform:uppercase;letter-spacing:1px;">Клиент</th>
                <th style="padding:8px;text-align:left;font-size:0.75rem;color:#c994b0;text-transform:uppercase;letter-spacing:1px;">Услуги</th>
                <th style="padding:8px;text-align:right;font-size:0.75rem;color:#c994b0;text-transform:uppercase;letter-spacing:1px;">Цена</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin-top:20px;color:#888;font-size:0.85rem;">Имат имейл и ще получат напомняне: ${bookings.filter(b=>b.clientEmail).length} от ${bookings.length}</p>
        </div>
      </div>`,
  });
}
