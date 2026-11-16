import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const INSTAGRAM_URL = "https://instagram.com/pav.nailed.it";

function readBookings() {
  try {
    const now = new Date();
    return JSON.parse(localStorage.getItem("pavBookings") || "[]").filter(b => {
      const [d, m, y] = String(b.date).split(".");
      const [hh, mm] = String(b.time).split(":");
      return new Date(y, m - 1, d, hh, mm) > now;
    });
  } catch {
    return [];
  }
}

function saveBookings(list) {
  try { localStorage.setItem("pavBookings", JSON.stringify(list)); } catch {}
}

export default function AlreadyBooked() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [linkBooking, setLinkBooking] = useState(null); // opened from the email cancel link
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null); // { type: "ok" | "error", text }
  const [ready, setReady] = useState(false);

  const isSuccess = router.query.success === "true";
  const focusId = typeof router.query.id === "string" ? router.query.id : null;

  useEffect(() => {
    if (!router.isReady) return;
    const list = readBookings();
    setBookings(list);
    const { id, token } = router.query;
    if (typeof id === "string" && typeof token === "string" && !list.some(b => b.id === id)) {
      setLinkBooking({ id, token });
    }
    setReady(true);
  }, [router.isReady, router.query]);

  const cancel = async (booking) => {
    const label = booking.date ? `часа на ${booking.date} в ${booking.time}` : "резервацията";
    if (!confirm(`Сигурна ли си, че искаш да отмениш ${label}?`)) return;
    setBusyId(booking.id);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/book?id=${encodeURIComponent(booking.id)}&token=${encodeURIComponent(booking.token)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok || res.status === 404) {
        const rest = readBookings().filter(b => b.id !== booking.id);
        saveBookings(rest);
        setBookings(rest);
        setLinkBooking(null);
        setMessage({
          type: "ok",
          text: res.ok ? "Резервацията е отменена. Изпратихме ти имейл с потвърждение." : "Тази резервация вече е отменена.",
        });
      } else {
        setMessage({ type: "error", text: data.message || "Неуспешна отмяна. Опитай отново или ми пиши в Instagram." });
      }
    } catch {
      setMessage({ type: "error", text: "Няма връзка. Опитай отново." });
    } finally {
      setBusyId(null);
    }
  };

  const ordered = focusId
    ? [...bookings].sort((a, b) => (a.id === focusId ? -1 : b.id === focusId ? 1 : 0))
    : bookings;
  const hasAny = ordered.length > 0 || linkBooking;

  let heading = "Твоите часове";
  if (isSuccess) heading = "Часът е запазен!";
  else if (linkBooking) heading = "Отмяна на резервация";
  else if (ready && !hasAny) heading = "Нямаш предстоящи часове";

  return (
    <>
      <Head>
        <title>{`${isSuccess ? "Часът е запазен" : "Моите часове"} – PavNailedIt`}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style jsx>{`
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 2rem 1rem; }
        .card { max-width: 480px; width: 100%; background: #fff; border-radius: 28px; padding: 3rem 2rem; text-align: center; box-shadow: 0 20px 60px rgba(249,161,194,0.2); border: 1px solid rgba(249,161,194,0.15); }
        h1 { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 400; color: var(--text-dark); margin-bottom: 0.75rem; }
        p { color: var(--text-mid); line-height: 1.7; margin-bottom: 1rem; }
        .booking-box { background: linear-gradient(135deg, #fff0f6, #fde8f0); border-radius: 18px; padding: 1.25rem; margin: 1rem 0; border: 1px solid rgba(249,161,194,0.3); }
        .booking-box.focus { border: 2px solid var(--accent); }
        .booking-date { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 600; color: var(--accent); }
        .booking-time { font-size: 1rem; color: var(--text-mid); margin-top: 0.25rem; }
        :global(.btn-home) { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; background: var(--accent); color: #fff; padding: 0.8rem 2rem; border-radius: 50px; font-weight: 600; font-size: 1rem; margin-top: 0.5rem; transition: background 0.2s; }
        :global(.btn-home):hover { background: var(--accent-hover); }
        .btn-cancel { display: inline-flex; align-items: center; min-height: 44px; margin-top: 0.5rem; background: none; border: none; color: var(--text-mid); font-size: 0.9rem; cursor: pointer; text-decoration: underline; font-family: 'DM Sans', sans-serif; padding: 0 0.5rem; }
        .btn-cancel:hover { color: #c53030; }
        .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        .note { font-size: 0.85rem; color: var(--text-mid); margin: 0.5rem 0 0; }
        .note a, .msg a { color: var(--accent); text-decoration: underline; }
        .msg { border-radius: 12px; padding: 0.8rem 1rem; margin: 1rem 0; font-size: 0.95rem; }
        .msg.ok { background: #f0fff4; color: #22543d; border: 1px solid #9ae6b4; }
        .msg.error { background: #fff5f5; color: #9b2c2c; border: 1px solid #feb2b2; }
      `}</style>

      <main className="page">
        <div className="card">
          <h1>{heading}</h1>

          {isSuccess && <p>Изпратихме ти имейл с потвърждение и линк за отмяна. Очаквам те!</p>}

          {message && (
            <div className={`msg ${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</div>
          )}

          {linkBooking && (
            <div className="booking-box focus">
              <p style={{ margin: 0 }}>Искаш ли да отмениш тази резервация?</p>
              <button type="button" className="btn-cancel" onClick={() => cancel(linkBooking)} disabled={busyId === linkBooking.id}>
                {busyId === linkBooking.id ? "Отменя се..." : "Отмени резервацията"}
              </button>
            </div>
          )}

          {ordered.map(b => (
            <div key={b.id} className={`booking-box ${b.id === focusId ? "focus" : ""}`}>
              <div className="booking-date">{b.date}</div>
              <div className="booking-time">в {b.time}</div>
              {b.token ? (
                <button type="button" className="btn-cancel" onClick={() => cancel(b)} disabled={busyId === b.id}>
                  {busyId === b.id ? "Отменя се..." : "Отмени този час"}
                </button>
              ) : (
                <p className="note">
                  За отмяна използвай линка от имейла си или пиши в <a href={INSTAGRAM_URL}>@pav.nailed.it</a>.
                </p>
              )}
            </div>
          ))}

          {ready && !hasAny && !message && (
            <p>Когато запазиш час от това устройство, ще го виждаш тук.</p>
          )}

          <Link href="/" className="btn-home">← Обратно към началото</Link>
        </div>
      </main>
    </>
  );
}
