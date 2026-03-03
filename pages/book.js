import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const SERVICES = [
  { name: "Гел - къси нокти", price: 18 },
  { name: "Гел - дълги нокти", price: 20 },
  { name: "Изграждане", price: 28 },
  { name: "1 нокът", price: 1.50, countable: true, max: 5 },
  { name: "Френски", price: 2 },
  { name: "Камъни", price: 0.2 },
  { name: "Стикери", price: 1 },
  { name: "Буква", price: 1 },
  { name: "Сребърно/златно", price: 2 },
];

const ADDONS = [
  { name: "3D цветя", price: 4, countable: true, max: 4 },
  { name: "3D линии", price: 4 },
  { name: "Blooming gel", price: 3 },
  { name: "Blooming gel цвете", price: 4 },
  { name: "Панделка", price: 2, countable: true, max: 4 },
  { name: "Аура", price: 3.5 },
  { name: "Омбре", price: 3.5 },
  { name: "Бяло омбре", price: 4 },
  { name: "Животински дизайн", price: 3 },
];

const TIMES = ["10:00", "14:00", "16:30"];
const HOLIDAYS = ["01.01.2025","03.03.2025","01.05.2025","06.05.2025","24.05.2025","06.09.2025","22.09.2025","24.12.2026","25.12.2026","26.12.2026"];
const BREAKS = [{ start: "20.12.2026", end: "25.12.2026" }];

function isWeekendOrHoliday(dateStr) {
  const [d, m, y] = dateStr.split(".").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  return day === 0 || day === 6 || HOLIDAYS.includes(dateStr);
}

export default function Book() {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selected, setSelected] = useState({});  // { serviceName: count }
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [giftCode, setGiftCode] = useState("");
  const [giftFeedback, setGiftFeedback] = useState("");
  const [giftDiscount, setGiftDiscount] = useState(0);
  const [giftValid, setGiftValid] = useState(false);
  const [designFile, setDesignFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const flatpickrRef = useRef(null);
  const fpInstance = useRef(null);

  // Check if already booked
  useEffect(() => {
    const id = localStorage.getItem("pavBooking");
    const date = localStorage.getItem("pavBookingDate");
    const time = localStorage.getItem("pavBookingTime");
    if (id && date && time) {
      const [d, m, y] = date.split(".");
      const [hh, mm] = time.split(":");
      const bookingDate = new Date(y, m - 1, d, hh, mm);
      if (new Date() < bookingDate) {
        window.location.href = "/already-booked";
        return;
      } else {
        localStorage.removeItem("pavBooking");
        localStorage.removeItem("pavBookingDate");
        localStorage.removeItem("pavBookingTime");
      }
    }
  }, []);

  // Load bookings
  useEffect(() => {
    fetch("/api/book")
      .then(r => r.json())
      .then(data => setBookings(data.bookings || []))
      .catch(console.error);
  }, []);

  // Init flatpickr
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("flatpickr").then(({ default: flatpickr }) => {
      import("flatpickr/dist/l10n/bg.js").then(({ Bulgarian }) => {
        fpInstance.current = flatpickr(flatpickrRef.current, {
          locale: Bulgarian,
          minDate: "today",
          dateFormat: "d.m.Y",
          disableMobile: true,
          disable: [
            (d) => d.getDay() === 1, // Monday
          ],
          onChange: ([date]) => {
            if (!date) return;
            const d = date.getDate().toString().padStart(2, "0");
            const m = (date.getMonth() + 1).toString().padStart(2, "0");
            const y = date.getFullYear();
            setSelectedDate(`${d}.${m}.${y}`);
            setSelectedTime("");
          },
        });
      });
    });
    return () => fpInstance.current?.destroy();
  }, []);

  const getBookedTimes = (date) => bookings.filter(b => b.date === date).map(b => b.time);

  const getAvailableTimes = () => {
    if (!selectedDate) return [];
    const bookedTimes = getBookedTimes(selectedDate);
    if (isWeekendOrHoliday(selectedDate)) {
      return TIMES.map(t => ({ time: t, available: !bookedTimes.includes(t) }));
    }
    return TIMES.map(t => ({
      time: t,
      available: t === "10:00" && !bookedTimes.includes(t),
      hidden: t !== "10:00",
    }));
  };

  const totalRaw = Object.entries(selected).reduce((sum, [name, count]) => {
    const svc = [...SERVICES, ...ADDONS].find(s => s.name === name);
    return sum + (svc ? svc.price * count : 0);
  }, 0);

  const totalPrice = Math.max(0, totalRaw - giftDiscount);

  const toggleService = (svc) => {
    setSelected(prev => {
      const current = prev[svc.name];
      if (!current) return { ...prev, [svc.name]: 1 };
      if (svc.countable && current < svc.max) return { ...prev, [svc.name]: current + 1 };
      const next = { ...prev };
      delete next[svc.name];
      return next;
    });
  };

  const applyGiftCard = async () => {
    if (!giftCode) return;
    const res = await fetch(`/api/giftcard?code=${giftCode}`);
    const data = await res.json();
    if (!res.ok || !data.cards?.length) {
      setGiftFeedback("❌ Невалиден код");
      return;
    }
    const card = data.cards.find(c => c.code === giftCode.toUpperCase());
    if (!card) { setGiftFeedback("❌ Невалиден код"); return; }
    if (card.used) { setGiftFeedback("❌ Тази карта вече е използвана"); return; }
    setGiftDiscount(card.amount);
    setGiftValid(true);
    setGiftFeedback(`✅ Приложена отстъпка: ${card.amount}€`);
  };

  const handleSubmit = async () => {
    setError("");
    const selectedServices = Object.keys(selected);
    if (!name || !phone || !email || !selectedDate || !selectedTime || selectedServices.length === 0) {
      setError("❌ Моля, попълнете всички задължителни полета.");
      return;
    }

    setLoading(true);

    // Mark gift card as used
    if (giftValid && giftCode) {
      await fetch("/api/giftcard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCode }),
      });
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("services", JSON.stringify(selectedServices));
    formData.append("date", selectedDate);
    formData.append("time", selectedTime);
    formData.append("totalPrice", totalPrice.toFixed(2));
    if (designFile) formData.append("design", designFile);

    const res = await fetch("/api/book", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      localStorage.setItem("pavBooking", data.id);
      localStorage.setItem("pavBookingDate", selectedDate);
      localStorage.setItem("pavBookingTime", selectedTime);
      window.location.href = "/already-booked?success=true";
    } else if (data?.error === "ALREADY_BOOKED") {
      window.location.href = "/already-booked";
    } else {
      setError(`❌ ${data.error || "Грешка при запазването"}`);
    }
  };

  const ServiceChip = ({ svc }) => {
    const count = selected[svc.name] || 0;
    const active = count > 0;
    return (
      <button
        className={`chip ${active ? "chip-active" : ""}`}
        onClick={() => toggleService(svc)}
        type="button"
      >
        {svc.name}
        {active && svc.countable && <span className="chip-count">{count}</span>}
        {active && <span className="chip-price">{svc.price}€</span>}
        <style jsx>{`
          .chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            border: 1.5px solid rgba(249,161,194,0.4);
            background: #fff;
            color: var(--text-mid);
            font-size: 0.88rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.25s;
            font-family: 'DM Sans', sans-serif;
          }
          .chip:hover { border-color: var(--pink-mid); transform: translateY(-2px); background: #fff0f6; }
          .chip-active { background: linear-gradient(135deg, #f8b7d1, #ff6ec4); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(255,110,196,0.3); }
          .chip-count {
            background: rgba(255,255,255,0.3);
            width: 20px; height: 20px;
            border-radius: 50%;
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 0.75rem; font-weight: 700;
          }
          .chip-price { font-size: 0.8rem; opacity: 0.9; }
        `}</style>
      </button>
    );
  };

  return (
    <>
      <Head>
        <title>Book Now – PavNailedIt</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" />
      </Head>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: var(--bg);
          padding: 2rem 1rem 4rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-light);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          transition: color 0.2s;
        }
        .back-link:hover { color: var(--pink-deep); }
        h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 300;
          text-align: center;
          color: var(--text-dark);
          margin-bottom: 2.5rem;
          letter-spacing: -0.5px;
        }
        h1 em { color: var(--pink-deep); font-style: italic; }
        .form-card {
          max-width: 620px;
          margin: 0 auto;
          background: #fff;
          border-radius: 28px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(249,161,194,0.15);
          border: 1px solid rgba(249,161,194,0.15);
        }
        .field { margin-bottom: 1.5rem; }
        label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }
        input[type=text], input[type=tel], input[type=email], input[type=file] {
          width: 100%;
          padding: 0.8rem 1.2rem;
          border-radius: 14px;
          border: 1.5px solid rgba(249,161,194,0.3);
          background: #fdf8fa;
          font-size: 0.95rem;
          color: var(--text-dark);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        input:focus {
          border-color: var(--pink-mid);
          box-shadow: 0 0 0 3px rgba(249,161,194,0.15);
          background: #fff;
        }
        .chips-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .section-label {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--pink-deep);
          margin-bottom: 0.75rem;
          display: block;
        }
        .divider {
          border: none;
          border-top: 1px solid rgba(249,161,194,0.2);
          margin: 1.5rem 0;
        }
        .time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .time-btn {
          padding: 0.8rem;
          border-radius: 14px;
          border: 1.5px solid rgba(249,161,194,0.3);
          background: #fdf8fa;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-mid);
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .time-btn:hover:not(:disabled) { border-color: var(--pink-mid); background: #fff0f6; }
        .time-btn.active { background: linear-gradient(135deg, #f8b7d1, #ff6ec4); color: #fff; border-color: transparent; box-shadow: 0 4px 15px rgba(255,110,196,0.35); }
        .time-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f5e0e8; }
        .gift-row { display: flex; gap: 0.75rem; align-items: center; }
        .gift-row input { flex: 1; }
        .gift-btn {
          white-space: nowrap;
          padding: 0.8rem 1.2rem;
          border-radius: 14px;
          border: 1.5px solid var(--pink-mid);
          background: #fff;
          color: var(--pink-deep);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .gift-btn:hover { background: var(--pink-light); }
        .gift-feedback { font-size: 0.9rem; font-weight: 500; color: var(--pink-deep); margin-top: 0.5rem; }
        .total {
          background: linear-gradient(135deg, #fff0f6, #fde8f0);
          border-radius: 16px;
          padding: 1.2rem 1.5rem;
          text-align: center;
          margin: 1.5rem 0;
          border: 1.5px solid rgba(249,161,194,0.3);
        }
        .total-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 600;
          color: var(--pink-deep);
        }
        .total-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); margin-bottom: 0.25rem; }
        .submit-btn {
          width: 100%;
          padding: 1.1rem;
          border: none;
          border-radius: 50px;
          background: linear-gradient(135deg, #f8b7d1, #ff6ec4);
          color: #fff;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 8px 25px rgba(255,110,196,0.4);
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.5px;
        }
        .submit-btn:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 12px 35px rgba(255,110,196,0.55); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { color: #e53e3e; font-size: 0.9rem; background: #fff5f5; border-radius: 12px; padding: 0.8rem 1rem; margin-bottom: 1rem; }
      `}</style>

      <div className="page">
        <div style={{maxWidth: '620px', margin: '0 auto'}}>
          <Link href="/" className="back-link">← Назад</Link>
        </div>
        <h1>Запази час <em>💅🏻</em></h1>

        <div className="form-card">
          {error && <div className="error">{error}</div>}

          {/* Personal info */}
          <div className="field">
            <label>Пълно Име</label>
            <input type="text" placeholder="Павлина Иванова" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Телефон</label>
            <input type="tel" placeholder="+359 88 123 4567" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Имейл</label>
            <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <hr className="divider" />

          {/* Services */}
          <span className="section-label">Основни услуги</span>
          <div className="chips-wrap">
            {SERVICES.map(svc => <ServiceChip key={svc.name} svc={svc} />)}
          </div>

          <br />
          <span className="section-label">Декорации</span>
          <div className="chips-wrap">
            {ADDONS.map(svc => <ServiceChip key={svc.name} svc={svc} />)}
          </div>

          <hr className="divider" />

          {/* Date */}
          <div className="field">
            <label>Дата</label>
            <input type="text" ref={flatpickrRef} placeholder="Избери дата" readOnly />
          </div>

          {/* Time */}
          {selectedDate && (
            <div className="field">
              <label>Час</label>
              <div className="time-grid">
                {getAvailableTimes().map(({ time, available, hidden }) => !hidden && (
                  <button
                    key={time}
                    type="button"
                    className={`time-btn ${selectedTime === time ? "active" : ""}`}
                    disabled={!available}
                    onClick={() => setSelectedTime(time)}
                  >
                    {available ? time : "Зает"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr className="divider" />

          {/* Design upload */}
          <div className="field">
            <label>Прикачи дизайн (по желание)</label>
            <input type="file" accept="image/*" onChange={e => setDesignFile(e.target.files[0])} />
          </div>

          {/* Gift card */}
          <div className="field">
            <label>Подаръчна карта</label>
            <div className="gift-row">
              <input
                type="text"
                placeholder="AB12C3"
                value={giftCode}
                onChange={e => setGiftCode(e.target.value.toUpperCase())}
                disabled={giftValid}
              />
              <button type="button" className="gift-btn" onClick={applyGiftCard} disabled={giftValid}>
                Приложи
              </button>
            </div>
            {giftFeedback && <p className="gift-feedback">{giftFeedback}</p>}
          </div>

          {/* Total */}
          <div className="total">
            <div className="total-label">Общо</div>
            <div className="total-amount">{totalPrice.toFixed(2)} €</div>
            {giftDiscount > 0 && (
              <div style={{fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px'}}>
                (спестяваш {giftDiscount}€ с карта)
              </div>
            )}
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Запазва се..." : "Запази час 💅"}
          </button>
        </div>
      </div>
    </>
  );
}
