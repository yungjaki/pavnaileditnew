import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import NailLengthPicker from "../components/NailLengthPicker";

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
  const [selected, setSelected] = useState({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [giftCode, setGiftCode] = useState("");
  const [giftFeedback, setGiftFeedback] = useState("");
  const [giftDiscount, setGiftDiscount] = useState(0);
  const [giftValid, setGiftValid] = useState(false);
  const [designFile, setDesignFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nailLength, setNailLength] = useState(null);
  const [error, setError] = useState("");
  const [breaks, setBreaks] = useState([]);
  const flatpickrRef = useRef(null);
  const fpInstance = useRef(null);

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

  useEffect(() => {
    fetch("/api/book")
      .then(r => r.json())
      .then(data => setBookings(data.bookings || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/admin/breaks")
      .then(r => r.json())
      .then(data => setBreaks(data.breaks || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!flatpickrRef.current) return;
    import("flatpickr").then(({ default: flatpickr }) => {
      import("flatpickr/dist/l10n/bg.js").then(({ Bulgarian }) => {
        fpInstance.current?.destroy();

        // Convert break date strings to Date objects for flatpickr
        const disabledRanges = breaks.map(b => ({
          from: new Date(b.start + "T00:00:00"),
          to:   new Date(b.end   + "T00:00:00"),
        }));

        fpInstance.current = flatpickr(flatpickrRef.current, {
          locale: Bulgarian,
          minDate: "today",
          dateFormat: "d.m.Y",
          disableMobile: true,
          disable: [
            (d) => d.getDay() === 2, // Tuesday
            ...disabledRanges,
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
  }, [breaks]);

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

  const NAIL_LENGTH_PRICES = { short: 0, medium: 2.5, long: 5, xlong: 7.5 };

  const totalRaw = Object.entries(selected).reduce((sum, [name, count]) => {
    const svc = [...SERVICES, ...ADDONS].find(s => s.name === name);
    return sum + (svc ? svc.price * count : 0);
  }, 0) + (nailLength ? NAIL_LENGTH_PRICES[nailLength] : 0);

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
    if (!res.ok || !data.cards?.length) { setGiftFeedback("❌ Невалиден код"); return; }
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
    if (nailLength) formData.append("nailLength", nailLength);
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

  const NAIL_LENGTHS = [
    { key: "short",  label: "Къси",    range: "0–2",  magnets: 2,  nailH: 18, price: "Базова",  extra: 0   },
    { key: "medium", label: "Средни",  range: "3–4",  magnets: 4,  nailH: 30, price: "+2.5€",   extra: 2.5 },
    { key: "long",   label: "Дълги",   range: "5–7",  magnets: 6,  nailH: 44, price: "+5€",     extra: 5   },
    { key: "xlong",  label: "X-Дълги", range: "8–10", magnets: 9,  nailH: 60, price: "+7.5€",   extra: 7.5 },
  ];

  const NailLengthPicker = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(null);
    const active = hovered || value;
    const activeData = NAIL_LENGTHS.find(n => n.key === active);

    return (
      <>
        <style>{`
          .nlp-wrap { margin-bottom: 1rem; }
          .nlp-scene {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 32px;
            background: linear-gradient(160deg, #fff5fa, #fce8f3);
            border-radius: 20px;
            padding: 20px 16px 0;
            margin-bottom: 14px;
            border: 1.5px solid rgba(249,161,194,0.25);
            min-height: 160px;
            position: relative;
            overflow: hidden;
          }
          .nlp-scene::before {
            content: '';
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 40px;
            background: linear-gradient(180deg, transparent, rgba(249,161,194,0.08));
          }
          /* FINGER */
          .nlp-finger-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
          }
          .nlp-nail {
            width: 44px;
            border-radius: 50% 50% 8px 8px;
            background: linear-gradient(160deg, #ffd6ec, #f06aad);
            box-shadow: inset -3px -3px 6px rgba(0,0,0,0.08), 0 2px 8px rgba(240,106,173,0.3);
            transition: height 0.5s cubic-bezier(0.34,1.56,0.64,1);
            position: relative;
            z-index: 2;
          }
          .nlp-nail::after {
            content: '';
            position: absolute;
            top: 5px; left: 6px;
            width: 12px; height: 6px;
            background: rgba(255,255,255,0.4);
            border-radius: 50%;
            transform: rotate(-20deg);
          }
          .nlp-finger-body {
            width: 48px;
            height: 90px;
            background: linear-gradient(180deg, #fde8d8, #f5cdb0);
            border-radius: 0 0 24px 24px;
            box-shadow: inset -4px 0 8px rgba(0,0,0,0.06), 2px 4px 12px rgba(0,0,0,0.08);
            position: relative;
            z-index: 1;
          }
          .nlp-finger-body::before {
            content: '';
            position: absolute;
            top: 8px; left: 8px;
            width: 6px; height: 30px;
            background: rgba(255,255,255,0.3);
            border-radius: 3px;
          }
          /* MAGNETS */
          .nlp-magnets {
            display: flex;
            flex-direction: column-reverse;
            align-items: center;
            gap: 3px;
            padding-bottom: 8px;
          }
          .nlp-magnet {
            width: 36px;
            height: 14px;
            border-radius: 4px;
            background: linear-gradient(135deg, #d0d0d0, #a8a8a8);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 7px;
            color: rgba(255,255,255,0.7);
            font-weight: 700;
            letter-spacing: 1px;
            transition: all 0.3s;
            animation: magnetDrop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
          }
          @keyframes magnetDrop {
            from { opacity: 0; transform: translateY(-10px) scale(0.8); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          /* INFO PANEL */
          .nlp-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-end;
            padding-bottom: 16px;
            min-width: 100px;
          }
          .nlp-info-range {
            font-size: 2rem;
            font-family: 'Cormorant Garamond', serif;
            font-weight: 600;
            color: var(--pink-deep);
            line-height: 1;
            transition: all 0.3s;
          }
          .nlp-info-mm {
            font-size: 0.72rem;
            color: var(--text-light);
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .nlp-info-label {
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 4px;
          }
          .nlp-info-price {
            font-size: 0.85rem;
            font-weight: 600;
            background: linear-gradient(135deg, #f8b7d1, #ff6ec4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .nlp-info-magnets {
            font-size: 0.75rem;
            color: var(--text-light);
            margin-top: 2px;
          }
          /* BUTTONS */
          .nlp-buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }
          .nlp-btn {
            padding: 0.6rem 0.4rem;
            border-radius: 14px;
            border: 2px solid rgba(249,161,194,0.3);
            background: #fdf8fa;
            cursor: pointer;
            transition: all 0.22s;
            font-family: 'DM Sans', sans-serif;
            text-align: center;
            outline: none;
          }
          .nlp-btn:hover { border-color: var(--pink-mid); background: #fff0f6; transform: translateY(-2px); }
          .nlp-btn.selected {
            border-color: #ff6ec4;
            background: linear-gradient(135deg, #fff0f8, #ffe4f2);
            box-shadow: 0 4px 14px rgba(255,110,196,0.25);
            transform: translateY(-3px);
          }
          .nlp-btn-label { font-size: 0.78rem; font-weight: 700; color: var(--text-dark); display: block; }
          .nlp-btn-range { font-size: 0.68rem; color: var(--text-light); display: block; margin: 1px 0; }
          .nlp-btn-price { font-size: 0.7rem; font-weight: 600; color: var(--pink-deep); display: block; }
          .nlp-btn.selected .nlp-btn-label { color: var(--pink-deep); }
          .nlp-hint {
            text-align: center;
            font-size: 0.78rem;
            color: var(--text-light);
            margin-top: 8px;
            letter-spacing: 0.3px;
          }
        `}</style>

        <div className="nlp-wrap">
          {/* Visual scene */}
          <div className="nlp-scene">
            {/* Finger with animated nail */}
            <div className="nlp-finger-wrap">
              <div className="nlp-nail" style={{ height: activeData ? activeData.nailH : 18 }} />
              <div className="nlp-finger-body" />
            </div>

            {/* Stacked magnets */}
            <div className="nlp-magnets">
              {Array.from({ length: activeData ? activeData.magnets : 2 }).map((_, i) => (
                <div key={i} className="nlp-magnet" style={{ animationDelay: `${i * 0.06}s` }}>
                  ▬▬
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="nlp-info">
              <div className="nlp-info-mm">магнити / мм</div>
              <div className="nlp-info-range">{activeData ? activeData.range : "0–2"}</div>
              <div className="nlp-info-label">{activeData ? activeData.label : "Избери"}</div>
              <div className="nlp-info-price">{activeData ? activeData.price : "—"}</div>
              <div className="nlp-info-magnets">{activeData ? `${activeData.magnets} магнита` : ""}</div>
            </div>
          </div>

          {/* Selector buttons */}
          <div className="nlp-buttons">
            {NAIL_LENGTHS.map(n => (
              <button
                key={n.key}
                type="button"
                className={`nlp-btn ${value === n.key ? "selected" : ""}`}
                onClick={() => onChange(value === n.key ? null : n.key)}
                onMouseEnter={() => setHovered(n.key)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="nlp-btn-label">{n.label}</span>
                <span className="nlp-btn-range">{n.range}mm</span>
                <span className="nlp-btn-price">{n.price}</span>
              </button>
            ))}
          </div>
          {!value && <p className="nlp-hint">✨ Избери дължина за да видиш цената</p>}
        </div>
      </>
    );
  };

  const ServiceChip = ({ svc }) => {
    const count = selected[svc.name] || 0;
    const active = count > 0;
    const isDisabled =
      (svc.name === "Гел - къси нокти"  && (nailLength === "long"  || nailLength === "xlong")) ||
      (svc.name === "Гел - дълги нокти" && (nailLength === "short" || nailLength === "medium"));
    return (
      <button
        className={`chip ${active ? "chip-active" : ""} ${isDisabled ? "chip-disabled" : ""}`}
        onClick={() => !isDisabled && toggleService(svc)}
        type="button"
        title={isDisabled ? "Не е съвместимо с избраната дължина" : ""}
        disabled={isDisabled}
      >
        {svc.name}
        {active && svc.countable && <span className="chip-count">{count}</span>}
        {active && <span className="chip-price">{svc.price}€</span>}
        <style jsx>{`
          .chip { display: inline-flex; align-items: center; gap: 6px; padding: 0.5rem 1rem; border-radius: 50px; border: 1.5px solid rgba(249,161,194,0.4); background: #fff; color: var(--text-mid); font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: all 0.25s; font-family: 'DM Sans', sans-serif; }
          .chip:hover:not(:disabled) { border-color: var(--pink-mid); transform: translateY(-2px); background: #fff0f6; }
          .chip-active { background: linear-gradient(135deg, #f8b7d1, #ff6ec4); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(255,110,196,0.3); }
          .chip-disabled { opacity: 0.35; cursor: not-allowed; background: #f5f5f5; border-color: #e0e0e0; text-decoration: line-through; }
          .chip-count { background: rgba(255,255,255,0.3); width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
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
        .page { min-height: 100vh; background: var(--bg); padding: 2rem 1rem 4rem; }
        .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-light); font-size: 0.9rem; margin-bottom: 1.5rem; transition: color 0.2s; }
        .back-link:hover { color: var(--pink-deep); }
        h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 300; text-align: center; color: var(--text-dark); margin-bottom: 2.5rem; letter-spacing: -0.5px; }
        h1 em { color: var(--pink-deep); font-style: italic; }
        .form-card { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 28px; padding: 2.5rem; box-shadow: 0 20px 60px rgba(249,161,194,0.15); border: 1px solid rgba(249,161,194,0.15); }
        .field { margin-bottom: 1.5rem; }
        label { display: block; font-size: 0.8rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-light); margin-bottom: 0.5rem; }
        input[type=text], input[type=tel], input[type=email], input[type=file] { width: 100%; padding: 0.8rem 1.2rem; border-radius: 14px; border: 1.5px solid rgba(249,161,194,0.3); background: #fdf8fa; font-size: 0.95rem; color: var(--text-dark); outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; }
        input:focus { border-color: var(--pink-mid); box-shadow: 0 0 0 3px rgba(249,161,194,0.15); background: #fff; }
        /* nail length picker styles injected via component */
        .chips-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .section-label { font-size: 0.8rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--pink-deep); margin-bottom: 0.75rem; display: block; }
        .divider { border: none; border-top: 1px solid rgba(249,161,194,0.2); margin: 1.5rem 0; }
        .time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .time-btn { padding: 0.8rem; border-radius: 14px; border: 1.5px solid rgba(249,161,194,0.3); background: #fdf8fa; font-size: 0.95rem; font-weight: 600; color: var(--text-mid); cursor: pointer; transition: all 0.25s; font-family: 'DM Sans', sans-serif; }
        .time-btn:hover:not(:disabled) { border-color: var(--pink-mid); background: #fff0f6; }
        .time-btn.active { background: linear-gradient(135deg, #f8b7d1, #ff6ec4); color: #fff; border-color: transparent; box-shadow: 0 4px 15px rgba(255,110,196,0.35); }
        .time-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f5e0e8; }
        .gift-row { display: flex; gap: 0.75rem; align-items: center; }
        .gift-row input { flex: 1; }
        .gift-btn { white-space: nowrap; padding: 0.8rem 1.2rem; border-radius: 14px; border: 1.5px solid var(--pink-mid); background: #fff; color: var(--pink-deep); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.25s; font-family: 'DM Sans', sans-serif; }
        .gift-btn:hover { background: var(--pink-light); }
        .gift-feedback { font-size: 0.9rem; font-weight: 500; color: var(--pink-deep); margin-top: 0.5rem; }
        .total { background: linear-gradient(135deg, #fff0f6, #fde8f0); border-radius: 16px; padding: 1.2rem 1.5rem; text-align: center; margin: 1.5rem 0; border: 1.5px solid rgba(249,161,194,0.3); }
        .total-amount { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: var(--pink-deep); }
        .total-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); margin-bottom: 0.25rem; }
        .submit-btn { width: 100%; padding: 1.1rem; border: none; border-radius: 50px; background: linear-gradient(135deg, #f8b7d1, #ff6ec4); color: #fff; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 25px rgba(255,110,196,0.4); font-family: 'DM Sans', sans-serif; letter-spacing: 0.5px; }
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

          <span className="section-label">Дължина на ноктите</span>
          <NailLengthPicker value={nailLength} onChange={setNailLength} />

          <hr className="divider" />

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

          <div className="field">
            <label>Дата</label>
            <input type="text" ref={flatpickrRef} placeholder="Избери дата" readOnly />
          </div>

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

          <div className="field">
            <label>Прикачи дизайн (по желание)</label>
            <input type="file" accept="image/*" onChange={e => setDesignFile(e.target.files[0])} />
          </div>

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