import nodemailer from "nodemailer";

const OWNER_EMAIL = "pavlina.dochevaas@gmail.com";

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendClientConfirmation({ name, email, date, time, services, totalPrice, designUrl }) {
  const transporter = createTransport();

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:'Helvetica Neue',Arial,sans-serif;background:#fdf0f5;margin:0;padding:0;}
    .wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(249,161,194,0.2);}
    .header{background:linear-gradient(135deg,#f8b7d1,#f9a1c2);padding:40px 30px;text-align:center;}
    .header h1{color:#fff;margin:0;font-size:2rem;}
    .header p{color:rgba(255,255,255,0.9);margin:8px 0 0;}
    .body{padding:35px 40px;}
    .body h2{color:#ff6ec4;font-size:1.4rem;margin-bottom:8px;}
    .body p{color:#555;line-height:1.7;margin:0 0 12px;}
    .details-box{background:#fff0f6;border-radius:15px;padding:20px 25px;margin:20px 0;}
    .detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #fdd8e8;}
    .detail-row:last-child{border-bottom:none;}
    .detail-label{color:#888;font-size:0.9rem;}
    .detail-value{color:#333;font-weight:600;}
    .services-box{background:#fff8fb;border-left:4px solid #f9a1c2;border-radius:0 12px 12px 0;padding:15px 20px;margin:15px 0;}
    .services-box p{margin:4px 0;color:#555;}
    .price-total{background:linear-gradient(135deg,#f8b7d1,#f9a1c2);border-radius:12px;padding:15px 25px;text-align:center;color:#fff;font-size:1.3rem;font-weight:700;margin:20px 0;}
    .warning-box{background:#fff3cd;border-radius:12px;padding:15px 20px;margin:20px 0;border-left:4px solid #ffc107;}
    .warning-box p{color:#856404;margin:4px 0;font-size:0.9rem;}
    .footer{background:#fdf0f5;text-align:center;padding:25px;color:#aaa;font-size:0.85rem;}
    .footer a{color:#f9a1c2;text-decoration:none;}
  </style></head><body>
  <div class="wrapper">
    <div class="header"><h1>💅 PavNailedIt</h1><p>Твоят час е запазен!</p></div>
    <div class="body">
      <h2>Здравей, ${name}! 🌸</h2>
      <p>Успешно запази час при мен. Радвам се да те видя!</p>
      <div class="details-box">
        <div class="detail-row"><span class="detail-label">📅 Дата</span><span class="detail-value">${date}</span></div>
        <div class="detail-row"><span class="detail-label">🕐 Час</span><span class="detail-value">${time}</span></div>
      </div>
      <p><strong>Избрани услуги:</strong></p>
      <div class="services-box">${services.map(s => `<p>• ${s}</p>`).join("")}</div>
      <div class="price-total">Общо: ${totalPrice} лв</div>
      ${designUrl ? `<p>✅ Твоят дизайн е прикачен към резервацията.</p>` : ""}
      <div class="warning-box">
        <p>⏰ <strong>Моля, бъди точна!</strong></p>
        <p>• 15 мин. закъснение → доплащане 10лв</p>
        <p>• 20+ мин. → часът се отменя</p>
      </div>
      <p>За въпроси: <a href="https://instagram.com/pavnailedit" style="color:#f9a1c2;">@pavnailedit</a> или +359 88 123 4567</p>
      <p>До скоро! 💖<br><strong>Павлина</strong></p>
    </div>
    <div class="footer"><p>© 2025 PavNailedIt • <a href="https://pavnailed.it">pavnailed.it</a></p></div>
  </div>
  </body></html>`;

  await transporter.sendMail({
    from: `"PavNailedIt 💅" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `💅 Часът ти е запазен – ${date} в ${time}`,
    html,
    text: `Здравей ${name}! Часът ти е запазен на ${date} в ${time}.\nУслуги: ${services.join(", ")}\nОбщо: ${totalPrice}лв`,
  });
}

export async function sendOwnerNotification({ name, phone, email, date, time, services, totalPrice, designUrl }) {
  const transporter = createTransport();

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;background:#fdf0f5;margin:0;padding:20px;}
    .wrapper{max-width:500px;margin:0 auto;background:#fff;border-radius:15px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1);}
    .header{background:linear-gradient(135deg,#f8b7d1,#f9a1c2);padding:25px 30px;}
    .header h1{color:#fff;margin:0;font-size:1.4rem;}
    .body{padding:25px 30px;}
    .row{display:flex;padding:8px 0;border-bottom:1px solid #f5e0e8;}
    .row:last-child{border-bottom:none;}
    .label{color:#888;width:120px;flex-shrink:0;font-size:0.9rem;}
    .value{color:#333;font-weight:600;font-size:0.9rem;}
    .services{background:#fff0f6;border-radius:10px;padding:12px 15px;margin:12px 0;}
    .services p{margin:3px 0;color:#555;font-size:0.9rem;}
    .price{color:#ff6ec4;font-weight:700;font-size:1.1rem;margin-top:10px;}
  </style></head><body>
  <div class="wrapper">
    <div class="header"><h1>🌸 Нова резервация!</h1></div>
    <div class="body">
      <div class="row"><span class="label">Клиент</span><span class="value">${name}</span></div>
      <div class="row"><span class="label">Телефон</span><span class="value">${phone}</span></div>
      <div class="row"><span class="label">Имейл</span><span class="value">${email}</span></div>
      <div class="row"><span class="label">Дата</span><span class="value">${date}</span></div>
      <div class="row"><span class="label">Час</span><span class="value">${time}</span></div>
      <div class="services"><strong>Услуги:</strong>${services.map(s => `<p>• ${s}</p>`).join("")}</div>
      <div class="price">Общо: ${totalPrice} лв</div>
      ${designUrl ? `<p style="margin-top:12px;">🖼️ <a href="${designUrl}" style="color:#f9a1c2;">Виж прикачения дизайн</a></p>` : ""}
    </div>
  </div>
  </body></html>`;

  await transporter.sendMail({
    from: `"PavNailedIt 💅" <${process.env.GMAIL_USER}>`,
    to: OWNER_EMAIL,
    subject: `🌸 Нова резервация: ${name} – ${date} в ${time}`,
    html,
    text: `Нова резервация!\nКлиент: ${name}\nТел: ${phone}\nИмейл: ${email}\nДата: ${date}\nЧас: ${time}\nУслуги: ${services.join(", ")}\nОбщо: ${totalPrice}лв`,
  });
}

export async function sendCancellationEmail({ name, email, date, time }) {
  const transporter = createTransport();

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;background:#fdf0f5;margin:0;padding:20px;}
    .wrapper{max-width:480px;margin:0 auto;background:#fff;border-radius:15px;overflow:hidden;}
    .header{background:#ff6b6b;padding:25px 30px;text-align:center;}
    .header h1{color:#fff;margin:0;font-size:1.4rem;}
    .body{padding:30px;color:#555;line-height:1.7;}
  </style></head><body>
  <div class="wrapper">
    <div class="header"><h1>❌ Часът е отменен</h1></div>
    <div class="body">
      <p>Здравей, <strong>${name}</strong>!</p>
      <p>Твоят час на <strong>${date}</strong> в <strong>${time}</strong> беше отменен.</p>
      <p>Ако искаш да запазиш нов час, посети <a href="https://pavnailed.it/book" style="color:#f9a1c2;">pavnailed.it</a>.</p>
      <p>За въпроси: <a href="https://instagram.com/pavnailedit" style="color:#f9a1c2;">@pavnailedit</a></p>
      <p>Поздрави,<br><strong>Павлина 💅</strong></p>
    </div>
  </div>
  </body></html>`;

  await transporter.sendMail({
    from: `"PavNailedIt 💅" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `❌ Отменен час – ${date} в ${time}`,
    html,
    text: `Здравей ${name}, часът ти на ${date} в ${time} беше отменен.`,
  });
}
