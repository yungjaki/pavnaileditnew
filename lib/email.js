import nodemailer from "nodemailer";

async function createTransporter() {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      `Missing email env vars: GOOGLE_CLIENT_ID=${!!clientId} GOOGLE_CLIENT_SECRET=${!!clientSecret} GOOGLE_REFRESH_TOKEN=${!!refreshToken}`
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "pavlina.dochevaas@gmail.com",
      clientId,
      clientSecret,
      refreshToken,
    },
  });

  // Verify the connection so errors surface immediately
  await transporter.verify();
  return transporter;
}

const FROM = `"PavNailedIt 💅" <pavlina.dochevaas@gmail.com>`;

export async function sendClientConfirmation({ name, email, date, time, services, totalPrice, designUrl }) {
  const t = await createTransporter();
  await t.sendMail({
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
            <tr><td style="padding:8px 0;color:#999;">💅 Услуги</td><td>${Array.isArray(services) ? services.join(", ") : services}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">💰 Цена</td><td><strong>${totalPrice} лв</strong></td></tr>
          </table>
          <div style="background:#fff5f9;border-left:3px solid #ff6ec4;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;font-size:0.9rem;">
            ⏰ <strong>Важно:</strong> При закъснение над 15 мин → +10лв. При 20+ мин → часът се отменя.
          </div>
          ${designUrl ? `<p>🖼️ <a href="${designUrl}" style="color:#ff6ec4;">Виж качения дизайн</a></p>` : ""}
          <p>До скоро! 💖<br><strong>Павлина — PavNailedIt</strong></p>
        </div>
      </div>`,
  });
}

export async function sendOwnerNotification({ name, email, phone, date, time, services, totalPrice, designUrl }) {
  const t = await createTransporter();
  await t.sendMail({
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
          <tr><td style="padding:6px 0;color:#999;">Услуги</td><td>${Array.isArray(services) ? services.join(", ") : services}</td></tr>
          <tr><td style="padding:6px 0;color:#999;">Цена</td><td><strong>${totalPrice} лв</strong></td></tr>
        </table>
        ${designUrl ? `<p><a href="${designUrl}" style="color:#ff6ec4;">🖼️ Виж дизайна</a></p>` : "<p>Без дизайн изображение</p>"}
      </div>`,
  });
}

export async function sendCancellationEmail({ name, email, date, time }) {
  const t = await createTransporter();
  await t.sendMail({
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
