import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import NailLengthPicker from "../components/NailLengthPicker";
import InspoGallery from "../components/InspoGallery";
import {
  SERVICES, ADDONS, ALL_ITEMS, TIMES, NAIL_LENGTH_PRICES, MAX_ACTIVE_BOOKINGS,
  isDateBlocked, getSlotsForDate, strToDate, toDateStr, isInBreak,
} from "../lib/bookingRules";

const LIMIT_MSG = `Вече имаш ${MAX_ACTIVE_BOOKINGS} запазени часа напред. Можеш да запазиш нов, след като мине някой от тях.`;

function readMyBookings() {
  try {
    const now = new Date();
    const arr = JSON.parse(localStorage.getItem("pavBookings") || "[]");
    return arr.filter(b => {
      const [d, m, y] = String(b.date).split(".");
      const [hh, mm] = String(b.time).split(":");
      return new Date(y, m - 1, d, hh, mm) > now;
    });
  } catch {
    return [];
  }
}

function ServiceChip({ svc, count, disabled, onToggle }) {
  const active = count > 0;
  const priceLabel = svc.countable ? `${svc.price}€ / бр.` : `${svc.price}€`;
  return (
    <button
      type="button"
      className={`chip ${active ? "chip-active" : ""}`}
      onClick={() => !disabled && onToggle(svc)}
      disabled={disabled}
      aria-pressed={active}
      title={disabled ? "Не е съвместимо с избраната дължина" : priceLabel}
    >
      {svc.icon && <span className="chip-icon" aria-hidden="true">{svc.icon}</span>}
      <span className="chip-name">{svc.name}</span>
      {active && svc.countable && <span className="chip-count">{count}</span>}
      <span className="chip-price">{priceLabel}</span>
      <style jsx>{`
        .chip { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0.5rem 0.95rem; border-radius: 50px; border: 1.5px solid rgba(201,64,144,0.3); background: #fff; color: var(--text-mid); font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: border-color 0.2s, background 0.2s, transform 0.2s var(--ease-out); font-family: 'DM Sans', sans-serif; }
        .chip:hover:not(:disabled) { border-color: var(--pink-deep); transform: translateY(-2px); background: #fff0f6; }
        .chip-active { background: var(--accent); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(194,24,91,0.25); }
        .chip-active:hover:not(:disabled) { background: var(--accent-hover); }
        .chip:disabled { opacity: 0.45; cursor: not-allowed; background: #f5f5f5; border-color: #e0e0e0; text-decoration: line-through; }
        .chip-icon { font-size: 1rem; line-height: 1; flex-shrink: 0; }
        .chip-name { line-height: 1.2; }
        .chip-count { background: rgba(255,255,255,0.3); min-width: 22px; height: 22px; border-radius: 11px; padding: 0 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; }
        .chip-price { font-size: 0.8rem; opacity: 0.85; }
      `}</style>
    </button>
  );
}

export default function Book() {
  const [takenSlots, setTakenSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selected, setSelected] = useState({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [giftCode, setGiftCode] = useState("");
  const [giftFeedback, setGiftFeedback] = useState("");
  const [giftAmount, setGiftAmount] = useState(0);
  const [giftValid, setGiftValid] = useState(false);
  const [giftChecking, setGiftChecking] = useState(false);
  const [designFile, setDesignFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nailLength, setNailLength] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [breaks, setBreaks] = useState([]);
  const [selectedInspoId, setSelectedInspoId] = useState(null);
  const [waitlistTime, setWaitlistTime] = useState(null);
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");
  const [stonePromptOpen, setStonePromptOpen] = useState(false);
  const [stoneInput, setStoneInput] = useState("");
  const flatpickrRef = useRef(null);
  const fpInstance = useRef(null);
  const errorRef = useRef(null);
  const stoneTriggerRef = useRef(null);

  useEffect(() => {
    // Migrate the old single-booking keys into the array format
    try {
      const legacyId = localStorage.getItem("pavBooking");
      const legacyDate = localStorage.getItem("pavBookingDate");
      const legacyTime = localStorage.getItem("pavBookingTime");
      if (legacyId && legacyDate && legacyTime) {
        const existing = JSON.parse(localStorage.getItem("pavBookings") || "[]");
        if (!existing.find(b => b.id === legacyId)) {
          existing.push({ id: legacyId, date: legacyDate, time: legacyTime });
        }
        localStorage.setItem("pavBookings", JSON.stringify(existing));
        ["pavBooking", "pavBookingDate", "pavBookingTime"].forEach(k => localStorage.removeItem(k));
      }
      const mine = readMyBookings();
      localStorage.setItem("pavBookings", JSON.stringify(mine));
      if (mine.length >= MAX_ACTIVE_BOOKINGS) setError(LIMIT_MSG);
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/book")
      .then(r => r.json())
      .then(data => setTakenSlots(data.slots || []))
      .catch(console.error);
    fetch("/api/admin/breaks")
      .then(r => r.json())
      .then(data => setBreaks(data.breaks || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!flatpickrRef.current) return;
    let cancelled = false;
    Promise.all([import("flatpickr"), import("flatpickr/dist/l10n/bg.js")]).then(([{ default: flatpickr }, { Bulgarian }]) => {
      if (cancelled) return;
      fpInstance.current?.destroy();

      const minBookingDate = new Date();
      minBookingDate.setDate(minBookingDate.getDate() + 3);

      const bookedOn = (dateStr) => takenSlots.filter(b => b.date === dateStr).map(b => b.time);
      const isFullyBooked = (date) => {
        const booked = bookedOn(toDateStr(date));
        return getSlotsForDate(date).every(t => booked.includes(t));
      };

      fpInstance.current = flatpickr(flatpickrRef.current, {
        locale: Bulgarian,
        minDate: minBookingDate,
        dateFormat: "d.m.Y",
        disableMobile: true,
        disable: [
          (d) => isDateBlocked(d),
          (d) => isFullyBooked(d),
          (d) => isInBreak(d, breaks),
        ],
        onChange: ([date]) => {
          if (!date) return;
          setSelectedDate(toDateStr(date));
          setSelectedTime("");
          setWaitlistTime(null);
          setFieldErrors(f => ({ ...f, date: undefined }));
        },
        onDayCreate: (_dObj, _dStr, _fp, dayElem) => {
          const date = dayElem.dateObj;
          if (!date || isDateBlocked(date) || isInBreak(date, breaks)) return;
          const slots = getSlotsForDate(date);
          const booked = bookedOn(toDateStr(date));
          const bookedCount = slots.filter(t => booked.includes(t)).length;
          if (bookedCount > 0 && bookedCount < slots.length) dayElem.classList.add("day-partial");
        },
      });
    });
    return () => { cancelled = true; fpInstance.current?.destroy(); };
  }, [breaks, takenSlots]);

  const getAvailableTimes = () => {
    if (!selectedDate) return [];
    const booked = takenSlots.filter(b => b.date === selectedDate).map(b => b.time);
    const slots = getSlotsForDate(strToDate(selectedDate));
    return TIMES.filter(t => slots.includes(t)).map(t => ({ time: t, available: !booked.includes(t) }));
  };

  const subtotal = Object.entries(selected).reduce((sum, [n, count]) => {
    const svc = ALL_ITEMS.find(s => s.name === n);
    return sum + (svc ? svc.price * count : 0);
  }, 0) + (nailLength ? NAIL_LENGTH_PRICES[nailLength] : 0);
  const discount = giftValid ? Math.min(giftAmount, subtotal) : 0;
  const totalPrice = Math.max(0, subtotal - discount);

  const handleInspoSelect = (inspo) => {
    if (!inspo) {
      setSelectedInspoId(null);
      return;
    }
    setSelectedInspoId(inspo.id);
    const newSelected = {};
    ALL_ITEMS.forEach(svc => {
      if (inspo.autoServices?.includes(svc.name) || inspo.autoAddons?.includes(svc.name)) newSelected[svc.name] = 1;
    });
    setSelected(prev => ({ ...prev, ...newSelected }));
    if (inspo.autoLength) setNailLength(inspo.autoLength);
    if (inspo.src) {
      fetch(inspo.src)
        .then(r => r.blob())
        .then(blob => setDesignFile(new File([blob], `inspo-${inspo.id}.jpg`, { type: blob.type || "image/jpeg" })))
        .catch(() => {});
    }
  };

  const toggleService = (svc) => {
    if (svc.name === "Камъни") {
      setStoneInput(selected["Камъни"] ? String(selected["Камъни"]) : "");
      setStonePromptOpen(true);
      return;
    }
    setFieldErrors(f => ({ ...f, services: undefined }));
    setSelected(prev => {
      const current = prev[svc.name];
      if (!current) return { ...prev, [svc.name]: 1 };
      if (svc.countable && current < svc.max) return { ...prev, [svc.name]: current + 1 };
      const next = { ...prev };
      delete next[svc.name];
      return next;
    });
  };

  const closeStonePrompt = () => {
    setStonePromptOpen(false);
    stoneTriggerRef.current?.querySelector("button")?.focus();
  };
  const confirmStones = () => {
    const qty = parseInt(stoneInput, 10);
    if (qty > 0 && qty <= 500) {
      setSelected(prev => ({ ...prev, "Камъни": qty }));
      closeStonePrompt();
    }
  };

  const applyGiftCard = async () => {
    if (!giftCode) return;
    setGiftChecking(true);
    try {
      const res = await fetch(`/api/giftcard?code=${encodeURIComponent(giftCode)}`);
      const data = await res.json();
      if (res.status === 429) setGiftFeedback("Твърде много опити. Опитай пак след малко.");
      else if (data.used) setGiftFeedback("Тази карта вече е използвана.");
      else if (!res.ok || !data.valid) setGiftFeedback("Невалиден код.");
      else {
        setGiftAmount(data.amount);
        setGiftValid(true);
        setGiftFeedback(`Приложена отстъпка: ${data.amount}€`);
      }
    } catch {
      setGiftFeedback("Неуспешна проверка. Опитай отново.");
    } finally {
      setGiftChecking(false);
    }
  };

  const [errorTick, setErrorTick] = useState(0);
  const showError = (msg, fields = {}) => {
    setError(msg);
    setFieldErrors(fields);
    setErrorTick(t => t + 1);
  };
  // Move focus to the error summary after it renders, so screen readers announce it.
  useEffect(() => {
    if (errorTick) errorRef.current?.focus();
  }, [errorTick]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (loading) return;
    setError("");
    const mine = readMyBookings();
    if (mine.length >= MAX_ACTIVE_BOOKINGS) return showError(LIMIT_MSG);

    const errs = {};
    if (name.trim().length < 2) errs.name = "Въведи име.";
    if (!/^\+?[0-9 ()\-]{6,20}$/.test(phone.trim())) errs.phone = "Въведи валиден телефон.";
    if (!/^\S+@\S+\.\S{2,}$/.test(email.trim())) errs.email = "Въведи валиден имейл.";
    if (Object.keys(selected).length === 0) errs.services = "Избери поне една услуга.";
    if (!selectedDate || !selectedTime) errs.date = "Избери дата и час.";
    if (!consent) errs.consent = "Нужно е съгласие за обработка на данните.";
    if (Object.keys(errs).length) return showError("Провери отбелязаните полета.", errs);

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("phone", phone.trim());
    formData.append("email", email.trim());
    formData.append("services", JSON.stringify(selected));
    formData.append("date", selectedDate);
    formData.append("time", selectedTime);
    formData.append("consent", String(consent));
    formData.append("website", website);
    if (giftValid && giftCode) formData.append("giftCode", giftCode);
    if (nailLength) formData.append("nailLength", nailLength);
    if (designFile) formData.append("design", designFile);

    try {
      const res = await fetch("/api/book", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        try {
          localStorage.setItem("pavBookings", JSON.stringify([
            ...mine,
            { id: data.id, date: data.date, time: data.time, token: data.cancelToken },
          ]));
        } catch {}
        window.location.href = `/already-booked?success=true&id=${encodeURIComponent(data.id)}`;
        return;
      }
      setLoading(false);
      if (data.error === "ALREADY_BOOKED") {
        setTakenSlots(s => [...s, { date: selectedDate, time: selectedTime }]);
        setSelectedTime("");
        showError("Този час току-що беше зает. Моля, избери друг.", { date: "Избери друг час." });
      } else if (data.error === "GIFT_USED" || data.error === "GIFT_INVALID") {
        setGiftValid(false);
        setGiftAmount(0);
        showError(data.message, { giftCode: data.message });
      } else {
        showError(data.message || "Грешка при запазването. Опитай отново.", data.fields || {});
      }
    } catch {
      setLoading(false);
      showError("Няма връзка. Провери интернета и опитай отново.");
    }
  };

  const joinWaitlist = async () => {
    setWaitlistError("");
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setWaitlistError("Попълни име, телефон и имейл.");
      return;
    }
    setWaitlistLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, date: selectedDate, time: waitlistTime, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setWaitlistDone(true);
      else setWaitlistError(data.message || "Неуспешно записване. Опитай отново.");
    } catch {
      setWaitlistError("Няма връзка. Опитай отново.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  const isChipDisabled = (svc) =>
    (svc.name === "Гел - къси нокти" && (nailLength === "long" || nailLength === "xlong")) ||
    (svc.name === "Гел - дълги нокти" && (nailLength === "short" || nailLength === "medium"));

  const fe = fieldErrors;
  const describedBy = (k) => (fe[k] ? `${k}-error` : undefined);

  return (
    <>
      <Head>
        <title>Запази час – PavNailedIt</title>
        <meta name="description" content="Запази час за маникюр в PavNailedIt, Пловдив — избери дизайн, дължина, дата и час." />
        <style>{`
          .flatpickr-day.day-partial {
            background: linear-gradient(135deg, #efefef 50%, #fff0f6 50%) !important;
            border-color: rgba(249,161,194,0.35) !important;
          }
        `}</style>
      </Head>

      <style jsx>{`
        .page { min-height: 100vh; background: var(--bg); padding: 2rem 1rem 4rem; }
        :global(.back-link) { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 44px; color: var(--text-light); font-size: 0.95rem; margin-bottom: 1rem; transition: color 0.2s; }
        :global(.back-link):hover { color: var(--pink-deep); }
        h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 300; text-align: center; color: var(--text-dark); margin-bottom: 2.5rem; letter-spacing: -0.5px; }
        .form-card { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 28px; padding: 2.5rem; box-shadow: 0 20px 60px rgba(249,161,194,0.15); border: 1px solid rgba(249,161,194,0.15); }
        @media (max-width: 480px) { .form-card { padding: 1.5rem 1.1rem; border-radius: 22px; } }
        .field { margin-bottom: 1.5rem; }
        label, .label { display: block; font-size: 0.8rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text-mid); margin-bottom: 0.5rem; }
        .req { color: var(--accent); }
        .control { width: 100%; min-height: 48px; padding: 0.8rem 1.2rem; border-radius: 14px; border: 1.5px solid rgba(176,128,151,0.45); background: #fdf8fa; font-size: 1rem; color: var(--text-dark); transition: border-color 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; }
        .control:focus { border-color: var(--pink-deep); box-shadow: 0 0 0 3px rgba(194,24,91,0.18); background: #fff; outline: none; }
        .control[aria-invalid="true"] { border-color: #c53030; }
        .field-error { color: #c53030; font-size: 0.85rem; margin-top: 0.4rem; }
        .hint { font-size: 0.85rem; color: var(--text-light); margin: -0.25rem 0 0.75rem; }
        .chips-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .section-label { font-size: 0.8rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); margin-bottom: 0.75rem; display: block; }
        .divider { border: none; border-top: 1px solid rgba(249,161,194,0.25); margin: 1.5rem 0; }
        .time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .time-btn { min-height: 52px; padding: 0.6rem; border-radius: 14px; border: 1.5px solid rgba(176,128,151,0.4); background: #fdf8fa; font-size: 1rem; font-weight: 600; color: var(--text-mid); cursor: pointer; transition: border-color 0.2s, background 0.2s; font-family: 'DM Sans', sans-serif; }
        .time-btn:hover { border-color: var(--pink-deep); background: #fff0f6; }
        .time-btn.active { background: var(--accent); color: #fff; border-color: transparent; box-shadow: 0 4px 15px rgba(194,24,91,0.3); }
        .time-btn.booked { background: #fdf0f5; border-style: dashed; color: var(--text-mid); font-size: 0.85rem; }
        .time-sub { display: block; font-size: 0.72rem; font-weight: 500; }
        .waitlist-box { margin-top: 1rem; background: linear-gradient(135deg,#fff5fb,#ffe8f4); border-radius: 16px; padding: 1.25rem; border: 1.5px solid rgba(249,161,194,0.35); }
        .waitlist-box h3 { font-family: 'DM Sans', sans-serif; margin: 0 0 0.4rem; font-size: 0.95rem; font-weight: 700; color: var(--accent); }
        .waitlist-box p { margin: 0 0 0.75rem; font-size: 0.85rem; color: var(--text-mid); }
        .stack { display: flex; flex-direction: column; gap: 8px; }
        .success-box { margin-top: 1rem; background: #f0fff4; border-radius: 16px; padding: 1.25rem; border: 1.5px solid rgba(72,187,120,0.35); text-align: center; color: #22543d; }
        .gift-row { display: flex; gap: 0.75rem; align-items: center; }
        .gift-row .control { flex: 1; }
        .btn-secondary { white-space: nowrap; min-height: 48px; padding: 0.8rem 1.2rem; border-radius: 14px; border: 1.5px solid var(--accent); background: #fff; color: var(--accent); font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: background 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn-secondary:hover:not(:disabled) { background: var(--pink-light); }
        .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
        .gift-feedback { font-size: 0.9rem; font-weight: 500; color: var(--text-mid); margin-top: 0.5rem; }
        .consent { display: flex; gap: 0.7rem; align-items: flex-start; font-size: 0.9rem; color: var(--text-mid); text-transform: none; letter-spacing: 0; font-weight: 400; }
        .consent input { width: 22px; height: 22px; margin-top: 1px; accent-color: var(--accent); flex-shrink: 0; }
        .consent :global(a) { color: var(--accent); text-decoration: underline; }
        .total { background: linear-gradient(135deg, #fff0f6, #fde8f0); border-radius: 16px; padding: 1.2rem 1.5rem; text-align: center; margin: 1.5rem 0; border: 1.5px solid rgba(249,161,194,0.3); }
        .total-amount { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: var(--accent); }
        .total-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-mid); margin-bottom: 0.25rem; }
        .total-note { font-size: 0.85rem; color: var(--text-mid); margin-top: 4px; }
        .submit-btn { width: 100%; min-height: 56px; padding: 1.1rem; border: none; border-radius: 50px; background: var(--accent); color: #fff; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.2s var(--ease-out); box-shadow: 0 8px 25px rgba(194,24,91,0.3); font-family: 'DM Sans', sans-serif; letter-spacing: 0.5px; }
        .submit-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-2px); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .error { color: #9b2c2c; font-size: 0.95rem; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 12px; padding: 0.8rem 1rem; margin-bottom: 1rem; }
        .error:focus { outline: 2px solid #c53030; outline-offset: 2px; }
        .hp { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal { background: #fff; border-radius: 20px; padding: 2rem; max-width: 340px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .modal h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; color: var(--text-dark); margin: 0 0 0.4rem; }
        .modal p { font-size: 0.9rem; color: var(--text-mid); margin: 0 0 1rem; }
        .modal-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
        .modal-actions button { flex: 1; min-height: 48px; border-radius: 12px; font-weight: 700; cursor: pointer; font-family: inherit; font-size: 0.95rem; }
        .btn-ghost { border: 1.5px solid rgba(176,128,151,0.45); background: #fff; color: var(--text-mid); }
        .btn-primary { border: none; background: var(--accent); color: #fff; }
      `}</style>

      {stonePromptOpen && (
        <div className="modal-backdrop" onClick={closeStonePrompt}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stones-title"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === "Escape") closeStonePrompt(); }}
          >
            <h2 id="stones-title">Камъни</h2>
            <p id="stones-desc">Колко камъни желаеш? (0.20€ / бр.)</p>
            <label htmlFor="stones-qty" className="label">Брой</label>
            <input
              id="stones-qty"
              className="control"
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              value={stoneInput}
              onChange={e => setStoneInput(e.target.value)}
              placeholder="напр. 5"
              aria-describedby="stones-desc"
              autoFocus
              onKeyDown={e => { if (e.key === "Enter") confirmStones(); }}
            />
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => {
                setSelected(prev => { const n = { ...prev }; delete n["Камъни"]; return n; });
                closeStonePrompt();
              }}>Премахни</button>
              <button type="button" className="btn-primary" onClick={confirmStones}>Потвърди</button>
            </div>
          </div>
        </div>
      )}

      <main className="page">
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>
          <Link href="/" className="back-link">← Назад</Link>
        </div>
        <h1>Запази час</h1>

        <form className="form-card" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="error" role="alert" tabIndex={-1} ref={errorRef}>{error}</div>
          )}

          {/* Honeypot — hidden from people and screen readers */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="name">Име и фамилия <span className="req" aria-hidden="true">*</span></label>
            <input id="name" name="name" className="control" type="text" autoComplete="name" required
              placeholder="Име Фамилия" value={name} onChange={e => setName(e.target.value)}
              aria-invalid={!!fe.name} aria-describedby={describedBy("name")} />
            {fe.name && <p className="field-error" id="name-error">{fe.name}</p>}
          </div>
          <div className="field">
            <label htmlFor="phone">Телефон <span className="req" aria-hidden="true">*</span></label>
            <input id="phone" name="phone" className="control" type="tel" autoComplete="tel" inputMode="tel" required
              placeholder="+359 88 123 4567" value={phone} onChange={e => setPhone(e.target.value)}
              aria-invalid={!!fe.phone} aria-describedby={describedBy("phone")} />
            {fe.phone && <p className="field-error" id="phone-error">{fe.phone}</p>}
          </div>
          <div className="field">
            <label htmlFor="email">Имейл <span className="req" aria-hidden="true">*</span></label>
            <input id="email" name="email" className="control" type="email" autoComplete="email" required
              placeholder="ime@example.com" value={email} onChange={e => setEmail(e.target.value)}
              aria-invalid={!!fe.email} aria-describedby={describedBy("email")} />
            {fe.email && <p className="field-error" id="email-error">{fe.email}</p>}
          </div>

          <InspoGallery onSelect={handleInspoSelect} selectedId={selectedInspoId} />

          <hr className="divider" />

          <span className="section-label" id="length-label">Дължина на ноктите</span>
          <NailLengthPicker value={nailLength} onChange={setNailLength} />

          <hr className="divider" />

          <fieldset style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={describedBy("services")}>
            <legend className="section-label">Основни услуги <span className="req" aria-hidden="true">*</span></legend>
            <div className="chips-wrap">
              {SERVICES.map(svc => (
                <span key={svc.name} ref={svc.name === "Камъни" ? stoneTriggerRef : undefined} style={{ display: "inline-flex" }}>
                  <ServiceChip svc={svc} count={selected[svc.name] || 0} disabled={isChipDisabled(svc)} onToggle={toggleService} />
                </span>
              ))}
            </div>
            {fe.services && <p className="field-error" id="services-error">{fe.services}</p>}
          </fieldset>

          <fieldset style={{ border: 0, padding: 0, margin: "1.5rem 0 0" }}>
            <legend className="section-label">Декорации</legend>
            <div className="chips-wrap">
              {ADDONS.map(svc => (
                <ServiceChip key={svc.name} svc={svc} count={selected[svc.name] || 0} disabled={false} onToggle={toggleService} />
              ))}
            </div>
          </fieldset>

          <hr className="divider" />

          <div className="field">
            <label htmlFor="date">Дата <span className="req" aria-hidden="true">*</span></label>
            <input id="date" className="control" type="text" ref={flatpickrRef} placeholder="Избери дата" readOnly
              aria-invalid={!!fe.date} aria-describedby={describedBy("date")} />
            {fe.date && <p className="field-error" id="date-error">{fe.date}</p>}
          </div>

          {selectedDate && (
            <div className="field">
              <span className="label" id="time-label">Час</span>
              <div className="time-grid" role="group" aria-labelledby="time-label">
                {getAvailableTimes().map(({ time, available }) => (
                  <button
                    key={time}
                    type="button"
                    className={`time-btn ${selectedTime === time ? "active" : ""} ${!available ? "booked" : ""}`}
                    aria-pressed={available ? selectedTime === time : waitlistTime === time}
                    aria-label={available ? time : `${time} – зает, запиши се в чакащия списък`}
                    onClick={() => {
                      if (available) {
                        setSelectedTime(time);
                        setWaitlistTime(null);
                        setFieldErrors(f => ({ ...f, date: undefined }));
                      } else {
                        setWaitlistTime(waitlistTime === time ? null : time);
                      }
                      setWaitlistDone(false);
                      setWaitlistError("");
                    }}
                  >
                    {available ? time : (<>{time}<span className="time-sub">зает · чакащ списък</span></>)}
                  </button>
                ))}
              </div>

              {waitlistTime && !waitlistDone && (
                <div className="waitlist-box">
                  <h3>Чакащ списък за {waitlistTime}</h3>
                  <p>Ако някой отмени, ще ти пишем веднага по имейл. Ползваме името, телефона и имейла от формата по-горе.</p>
                  <div className="stack">
                    {(!name || !phone || !email) && (
                      <p style={{ margin: 0 }}>Попълни първо име, телефон и имейл в началото на формата.</p>
                    )}
                    <button type="button" className="btn-secondary" disabled={waitlistLoading} onClick={joinWaitlist}>
                      {waitlistLoading ? "Записване..." : "Запиши ме в списъка"}
                    </button>
                    {waitlistError && <p className="field-error" role="alert">{waitlistError}</p>}
                  </div>
                </div>
              )}

              {waitlistDone && (
                <div className="success-box" role="status">
                  <p style={{ margin: 0, fontWeight: 700 }}>Записана си в чакащия списък!</p>
                  <p style={{ margin: "6px 0 0", fontSize: "0.85rem" }}>Ще получиш имейл веднага щом се освободи часът.</p>
                </div>
              )}
            </div>
          )}

          <hr className="divider" />

          <div className="field">
            <label htmlFor="design">Прикачи дизайн (по желание)</label>
            <p className="hint" id="design-hint">Снимка (JPG, PNG, WEBP), до 5 MB.</p>
            <input
              id="design"
              className="control"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              aria-describedby="design-hint"
              onChange={e => {
                const f = e.target.files[0];
                if (f && f.size > 5 * 1024 * 1024) {
                  setFieldErrors(x => ({ ...x, design: "Снимката е над 5 MB." }));
                  e.target.value = "";
                  return;
                }
                setFieldErrors(x => ({ ...x, design: undefined }));
                setDesignFile(f || null);
                setSelectedInspoId(null);
              }}
            />
            {fe.design && <p className="field-error">{fe.design}</p>}
          </div>

          <div className="field">
            <label htmlFor="gift">Подаръчна карта</label>
            <div className="gift-row">
              <input
                id="gift"
                className="control"
                type="text"
                autoComplete="off"
                placeholder="Код от картата"
                value={giftCode}
                onChange={e => { setGiftCode(e.target.value.toUpperCase()); setGiftFeedback(""); }}
                disabled={giftValid}
                aria-describedby="gift-feedback"
                aria-invalid={!!fe.giftCode}
              />
              <button type="button" className="btn-secondary" onClick={applyGiftCard} disabled={giftValid || giftChecking || !giftCode}>
                {giftChecking ? "..." : "Приложи"}
              </button>
            </div>
            <p className="gift-feedback" id="gift-feedback" role="status">{giftFeedback}</p>
          </div>

          <div className="total" aria-live="polite">
            <div className="total-label">Общо</div>
            <div className="total-amount">{totalPrice.toFixed(2)} €</div>
            {discount > 0 && <div className="total-note">(спестяваш {discount.toFixed(2)}€ с карта)</div>}
          </div>

          <div className="field">
            <label className="consent" htmlFor="consent">
              <input id="consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                aria-invalid={!!fe.consent} aria-describedby={describedBy("consent")} />
              <span>
                Съгласна съм данните ми (име, телефон, имейл и качена снимка) да се използват за резервацията,
                според <Link href="/privacy">политиката за поверителност</Link>.
              </span>
            </label>
            {fe.consent && <p className="field-error" id="consent-error">{fe.consent}</p>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Запазва се..." : "Запази час"}
          </button>
        </form>
      </main>
    </>
  );
}
