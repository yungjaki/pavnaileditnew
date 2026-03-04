import Head from "next/head";
import { useState, useEffect, useRef } from "react";

const NAIL_LENGTH_LABELS = {
  short:  "Къси (0–2mm)",
  medium: "Средни (3–4mm)",
  long:   "Дълги (5–7mm)",
  xlong:  "X-Дълги (8–10mm)",
};

// ─── helpers ──────────────────────────────────────────────
function toDateObj(dateStr, timeStr = "00:00") {
  const [d, m, y] = (dateStr || "").split(".");
  const [h, min] = (timeStr || "00:00").split(":");
  if (!d || !m || !y) return new Date(NaN);
  return new Date(+y, +m - 1, +d, +h || 0, +min || 0);
}

function formatYMD(dateStr) {
  const dt = toDateObj(dateStr);
  if (isNaN(dt)) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

// ─── Login screen ─────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) onLogin();
    else setErr("❌ Грешна парола");
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-icon">💅</div>
        <h1>Admin Panel</h1>
        <p>PavNailedIt</p>
        <input
          type="password"
          placeholder="Парола..."
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
        />
        {err && <div className="login-err">{err}</div>}
        <button onClick={submit} disabled={loading}>
          {loading ? "Влизане..." : "Вход →"}
        </button>
      </div>
      <style jsx>{`
        .login-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fde8f0, #fff0f6);
        }
        .login-card {
          background: #fff;
          border-radius: 28px;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 380px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(249, 161, 194, 0.25);
          border: 1px solid rgba(249, 161, 194, 0.2);
        }
        .login-icon { font-size: 3rem; margin-bottom: 0.5rem; }
        h1 {
          font-family: "Cormorant Garamond", serif;
          font-size: 2rem;
          font-weight: 400;
          color: #2c1a24;
          margin: 0;
        }
        p { color: #b08097; font-size: 0.9rem; margin: 0.25rem 0 1.5rem; }
        input {
          width: 100%;
          padding: 0.9rem 1.2rem;
          border-radius: 14px;
          border: 1.5px solid rgba(249, 161, 194, 0.4);
          background: #fdf8fa;
          font-size: 1rem;
          outline: none;
          margin-bottom: 0.75rem;
          font-family: "DM Sans", sans-serif;
          transition: border-color 0.2s;
        }
        input:focus { border-color: #f9a1c2; }
        .login-err {
          color: #e53e3e;
          font-size: 0.88rem;
          margin-bottom: 0.75rem;
          background: #fff5f5;
          border-radius: 10px;
          padding: 0.5rem;
        }
        button {
          width: 100%;
          padding: 0.9rem;
          border: none;
          border-radius: 50px;
          background: linear-gradient(135deg, #f8b7d1, #ff6ec4);
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 6px 20px rgba(255, 110, 196, 0.35);
          font-family: "DM Sans", sans-serif;
        }
        button:hover:not(:disabled) { transform: scale(1.03); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

// ─── Main admin dashboard ─────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("appointments"); // appointments | calendar | giftcards | breaks
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [giftCode, setGiftCode] = useState("");
  const [giftAmount, setGiftAmount] = useState("");
  const [giftMsg, setGiftMsg] = useState("");
  const [breaks, setBreaks] = useState([]);
  const [breakStart, setBreakStart] = useState("");
  const [breakEnd, setBreakEnd] = useState("");
  const [breakLabel, setBreakLabel] = useState("");
  const [breakMsg, setBreakMsg] = useState("");
  const calendarRef = useRef(null);
  const fpCalRef = useRef(null);

  // Check if already logged in (cookie still valid)
  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((r) => {
        if (r.ok) setAuthed(true);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/bookings");
    if (res.ok) {
      const data = await res.json();
      setBookings(data.bookings || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchBookings();
  }, [authed]);

  const fetchBreaks = async () => {
    const res = await fetch("/api/admin/breaks");
    if (res.ok) {
      const data = await res.json();
      setBreaks(data.breaks || []);
    }
  };

  useEffect(() => {
    if (authed) fetchBreaks();
  }, [authed]);

  // Init FullCalendar when tab switches to calendar
  useEffect(() => {
    if (tab !== "calendar" || !authed || typeof window === "undefined") return;
    let calendar;
    import("@fullcalendar/core").then(({ Calendar }) => {
      import("@fullcalendar/daygrid").then(({ default: dayGridPlugin }) => {
        import("@fullcalendar/core/locales/bg").then(({ default: bgLocale }) => {
          if (!calendarRef.current) return;
          calendar = new Calendar(calendarRef.current, {
            plugins: [dayGridPlugin],
            locale: bgLocale,
            initialView: "dayGridMonth",
            height: "auto",
            events: bookings.map((b) => ({
              title: `${b.time} — ${b.name}`,
              start: (() => {
                const [d, m, y] = (b.date || "").split(".");
                return `${y}-${m}-${d}T${b.time}:00`;
              })(),
              extendedProps: {
                services: Array.isArray(b.services) ? b.services : (b.services ? b.services.split(',').map(s => s.trim()) : []),
                totalPrice: parseFloat(b.totalPrice) || 0,
                phone: b.phone || "",
              },
            })),
            eventDidMount(info) {
              info.el.title = `${info.event.title}\n${(Array.isArray(info.event.extendedProps.services) ? info.event.extendedProps.services : [info.event.extendedProps.services]).join(", ")}\nОбщо: ${info.event.extendedProps.totalPrice?.toFixed(2)} лв`;
            },
          });
          calendar.render();
          fpCalRef.current = calendar;
        });
      });
    });
    return () => calendar?.destroy();
  }, [tab, authed, bookings]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  const handleCancel = async (id, name) => {
    if (!confirm(`Отмени час на ${name}?`)) return;
    const res = await fetch("/api/admin/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      alert("✅ Часът е отменен и клиентът е уведомен по имейл.");
      fetchBookings();
    } else {
      const d = await res.json();
      alert(`❌ ${d.error}`);
    }
  };

  const handleReschedule = async (id, name, oldDate, oldTime) => {
    const newDate = prompt(`Нова дата за ${name} (ДД.ММ.ГГГГ):`, oldDate);
    if (!newDate) return;
    const newTime = prompt("Нов час (ЧЧ:ММ):", oldTime);
    if (!newTime) return;
    const res = await fetch("/api/admin/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newDate, newTime }),
    });
    const d = await res.json();
    if (res.ok) {
      alert("✅ Часът е преместен и клиентът е уведомен.");
      fetchBookings();
    } else {
      alert(`❌ ${d.error}`);
    }
  };

  const createGiftCard = async () => {
    if (!giftCode || !giftAmount) return setGiftMsg("❌ Попълни код и сума");
    const res = await fetch("/api/giftcard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: giftCode.toUpperCase(), amount: parseFloat(giftAmount) }),
    });
    if (res.ok) {
      setGiftMsg(`✅ Картата "${giftCode.toUpperCase()}" (${giftAmount}лв) е създадена!`);
      setGiftCode("");
      setGiftAmount("");
    } else {
      const d = await res.json();
      setGiftMsg(`❌ ${d.error}`);
    }
  };

  // Filtered & sorted appointments
  const displayed = bookings
    .filter((b) => !filterDate || formatYMD(b.date) === filterDate)
    .sort((a, b) => {
      const da = toDateObj(a.date, a.time);
      const db = toDateObj(b.date, b.time);
      return sortOrder === "asc" ? da - db : db - da;
    });

  if (checking) return null;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <>
      <Head>
        <title>Admin – PavNailedIt</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.11/main.min.css"
        />
      </Head>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page {
          min-height: 100vh;
          background: linear-gradient(135deg, #fdf5f8, #fff0f6);
          font-family: "DM Sans", sans-serif;
        }

        /* TOP BAR */
        .topbar {
          background: #fff;
          border-bottom: 1px solid rgba(249, 161, 194, 0.2);
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 4px 20px rgba(249, 161, 194, 0.1);
        }
        .topbar-logo {
          font-family: "Cormorant Garamond", serif;
          font-size: 1.5rem;
          color: #ff6ec4;
          font-weight: 600;
        }
        .topbar-right { display: flex; align-items: center; gap: 1rem; }
        .topbar-right span { color: #b08097; font-size: 0.85rem; }
        .logout-btn {
          background: none;
          border: 1.5px solid rgba(249, 161, 194, 0.5);
          color: #b08097;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: "DM Sans", sans-serif;
        }
        .logout-btn:hover { border-color: #ff6ec4; color: #ff6ec4; }

        /* TABS */
        .tabs {
          display: flex;
          gap: 0.5rem;
          padding: 1.5rem 2rem 0;
          max-width: 1100px;
          margin: 0 auto;
        }
        .tab {
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          border: 1.5px solid rgba(249, 161, 194, 0.3);
          background: #fff;
          color: #b08097;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: "DM Sans", sans-serif;
        }
        .tab:hover { border-color: #f9a1c2; color: #ff6ec4; }
        .tab.active {
          background: linear-gradient(135deg, #f8b7d1, #ff6ec4);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(255, 110, 196, 0.3);
        }

        /* CONTENT */
        .content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* STATS ROW */
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 600px) { .stats { grid-template-columns: 1fr; } }
        .stat-card {
          background: #fff;
          border-radius: 18px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(249, 161, 194, 0.12);
          border: 1px solid rgba(249, 161, 194, 0.15);
        }
        .stat-value {
          font-family: "Cormorant Garamond", serif;
          font-size: 2.2rem;
          font-weight: 600;
          color: #ff6ec4;
        }
        .stat-label { color: #b08097; font-size: 0.8rem; margin-top: 0.25rem; letter-spacing: 0.5px; }

        /* FILTERS */
        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .filters input, .filters select {
          padding: 0.6rem 1rem;
          border-radius: 12px;
          border: 1.5px solid rgba(249, 161, 194, 0.3);
          background: #fff;
          font-size: 0.9rem;
          color: #2c1a24;
          outline: none;
          font-family: "DM Sans", sans-serif;
          transition: border-color 0.2s;
        }
        .filters input:focus, .filters select:focus { border-color: #f9a1c2; }
        .clear-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          border: 1.5px solid rgba(249, 161, 194, 0.3);
          background: #fff;
          color: #b08097;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: "DM Sans", sans-serif;
        }
        .clear-btn:hover { border-color: #f9a1c2; color: #ff6ec4; }

        /* APPOINTMENT CARDS */
        .cards { display: grid; gap: 1rem; }
        .card {
          background: #fff;
          border-radius: 18px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          box-shadow: 0 4px 20px rgba(249, 161, 194, 0.1);
          border: 1px solid rgba(249, 161, 194, 0.15);
          transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-2px); }
        .card-left { flex: 1; }
        .card-name {
          font-weight: 600;
          font-size: 1rem;
          color: #2c1a24;
          margin-bottom: 0.35rem;
        }
        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .badge {
          background: #fff0f6;
          color: #ff6ec4;
          padding: 0.2rem 0.7rem;
          border-radius: 50px;
          font-size: 0.78rem;
          font-weight: 600;
          border: 1px solid rgba(249, 161, 194, 0.3);
        }
        .card-services {
          color: #b08097;
          font-size: 0.85rem;
          margin-bottom: 0.35rem;
        }
        .card-price {
          font-weight: 700;
          color: #ff6ec4;
          font-size: 0.95rem;
        }
        .card-design { margin-top: 0.4rem; }
        .card-design a {
          color: #f9a1c2;
          font-size: 0.82rem;
          text-decoration: none;
        }
        .card-design a:hover { text-decoration: underline; }
        .card-actions { display: flex; flex-direction: column; gap: 0.5rem; flex-shrink: 0; }
        .btn-cancel {
          padding: 0.5rem 1.1rem;
          border-radius: 50px;
          border: 1.5px solid #ff6b6b;
          background: #fff5f5;
          color: #e53e3e;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: "DM Sans", sans-serif;
        }
        .btn-cancel:hover { background: #e53e3e; color: #fff; }
        .btn-reschedule {
          padding: 0.5rem 1.1rem;
          border-radius: 50px;
          border: 1.5px solid rgba(249, 161, 194, 0.4);
          background: #fff0f6;
          color: #ff6ec4;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: "DM Sans", sans-serif;
        }
        .btn-reschedule:hover { background: #ff6ec4; color: #fff; }

        /* CALENDAR TAB */
        .calendar-wrap {
          background: #fff;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(249, 161, 194, 0.12);
          border: 1px solid rgba(249, 161, 194, 0.15);
        }

        /* GIFT CARDS TAB */
        .gift-box {
          background: #fff;
          border-radius: 20px;
          padding: 2rem;
          max-width: 480px;
          box-shadow: 0 4px 20px rgba(249, 161, 194, 0.12);
          border: 1px solid rgba(249, 161, 194, 0.15);
        }
        .gift-box h2 {
          font-family: "Cormorant Garamond", serif;
          font-size: 1.6rem;
          font-weight: 400;
          color: #2c1a24;
          margin-bottom: 1.25rem;
        }
        .gift-row { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
        .gift-row input {
          flex: 1;
          padding: 0.8rem 1rem;
          border-radius: 14px;
          border: 1.5px solid rgba(249, 161, 194, 0.3);
          background: #fdf8fa;
          font-size: 0.95rem;
          outline: none;
          font-family: "DM Sans", sans-serif;
          transition: border-color 0.2s;
        }
        .gift-row input:focus { border-color: #f9a1c2; }
        .gift-create-btn {
          width: 100%;
          padding: 0.9rem;
          border: none;
          border-radius: 50px;
          background: linear-gradient(135deg, #f8b7d1, #ff6ec4);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 6px 20px rgba(255, 110, 196, 0.3);
          font-family: "DM Sans", sans-serif;
        }
        .gift-create-btn:hover { transform: scale(1.02); }
        .gift-msg { margin-top: 0.75rem; font-size: 0.9rem; font-weight: 500; color: #ff6ec4; }

        .empty { color: #b08097; text-align: center; padding: 3rem; font-size: 0.95rem; }
      `}</style>

      <div className="page">
        {/* TOP BAR */}
        <div className="topbar">
          <div className="topbar-logo">💅 PavNailedIt Admin</div>
          <div className="topbar-right">
            <span>Здравей, Павлина! 🌸</span>
            <button className="logout-btn" onClick={handleLogout}>Изход</button>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {[
            { id: "appointments", label: "📋 Резервации" },
            { id: "calendar", label: "📅 Календар" },
            { id: "giftcards", label: "🎁 Подаръчни карти" },
            { id: "breaks", label: "🌴 Почивки" },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="content">

          {/* ── APPOINTMENTS TAB ── */}
          {tab === "appointments" && (
            <>
              {/* Stats */}
              <div className="stats">
                <div className="stat-card">
                  <div className="stat-value">{bookings.length}</div>
                  <div className="stat-label">ОБЩО РЕЗЕРВАЦИИ</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {bookings.filter((b) => {
                      const d = toDateObj(b.date, b.time);
                      return d >= new Date();
                    }).length}
                  </div>
                  <div className="stat-label">ПРЕДСТОЯЩИ</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {bookings
                      .reduce((s, b) => s + (parseFloat(b.totalPrice) || 0), 0)
                      .toFixed(0)}
                    лв
                  </div>
                  <div className="stat-label">ОБЩ ПРИХОД</div>
                </div>
              </div>

              {/* Filters */}
              <div className="filters">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="asc">↑ Най-стари първо</option>
                  <option value="desc">↓ Най-нови първо</option>
                </select>
                <button
                  className="clear-btn"
                  onClick={() => { setFilterDate(""); setSortOrder("asc"); }}
                >
                  Изчисти
                </button>
              </div>

              {/* Cards */}
              {loading ? (
                <div className="empty">Зарежда се...</div>
              ) : displayed.length === 0 ? (
                <div className="empty">Няма резервации 🌸</div>
              ) : (
                <div className="cards">
                  {displayed.map((b) => (
                    <div key={b.id} className="card">
                      <div className="card-left">
                        <div className="card-name">{b.name}</div>
                        <div className="card-meta">
                          <span className="badge">📅 {b.date}</span>
                          <span className="badge">🕐 {b.time}</span>
                          {b.phone && <span className="badge">📞 {b.phone}</span>}
                          {b.clientEmail && <span className="badge">✉️ {b.clientEmail}</span>}
                        </div>
                        {b.nailLength && (
                          <div style={{fontSize:'0.82rem',color:'#888',marginTop:'4px'}}>
                            💅 Дължина: <strong>{NAIL_LENGTH_LABELS[b.nailLength] || b.nailLength}</strong>
                          </div>
                        )}
                        {b.services?.length > 0 && (
                          <div className="card-services">
                            💅 {(Array.isArray(b.services) ? b.services : [b.services]).join(", ")}
                          </div>
                        )}
                        <div className="card-price">
                          💰 {parseFloat(b.totalPrice || 0).toFixed(2)} лв
                        </div>
                        {b.designUrl && (
                          <div className="card-design">
                            <a href={b.designUrl} target="_blank" rel="noopener noreferrer">
                              🖼️ Виж дизайн
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn-reschedule"
                          onClick={() => handleReschedule(b.id, b.name, b.date, b.time)}
                        >
                          Премести
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(b.id, b.name)}
                        >
                          Откажи
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── CALENDAR TAB ── */}
          {tab === "calendar" && (
            <div className="calendar-wrap">
              <div ref={calendarRef} />
            </div>
          )}

          {/* ── GIFT CARDS TAB ── */}
          {tab === "giftcards" && (
            <div className="gift-box">
              <h2>🎁 Създай подаръчна карта</h2>
              <div className="gift-row">
                <input
                  type="text"
                  placeholder="Код (напр. PINK50)"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                />
              </div>
              <div className="gift-row">
                <input
                  type="number"
                  placeholder="Сума в лв (напр. 50)"
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(e.target.value)}
                />
              </div>
              <button className="gift-create-btn" onClick={createGiftCard}>
                Създай карта ✨
              </button>
              {giftMsg && <div className="gift-msg">{giftMsg}</div>}
            </div>
          )}

          {tab === "breaks" && (
            <div className="gift-box">
              <h2>🌴 Управление на почивки</h2>
              <p style={{color:"#999",fontSize:"0.9rem",marginBottom:"1.5rem"}}>
                Добави периоди когато не работиш — тези дати ще бъдат блокирани в календара за записване.
              </p>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"0.75rem"}}>
                <div>
                  <label style={{fontSize:"0.75rem",fontWeight:700,color:"#aaa",letterSpacing:"1px",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>От дата</label>
                  <input
                    type="date"
                    value={breakStart}
                    onChange={e => setBreakStart(e.target.value)}
                    style={{width:"100%",padding:"0.7rem 1rem",borderRadius:"12px",border:"1.5px solid rgba(249,161,194,0.3)",background:"#fdf8fa",fontSize:"0.9rem",fontFamily:"inherit",outline:"none"}}
                  />
                </div>
                <div>
                  <label style={{fontSize:"0.75rem",fontWeight:700,color:"#aaa",letterSpacing:"1px",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>До дата</label>
                  <input
                    type="date"
                    value={breakEnd}
                    onChange={e => setBreakEnd(e.target.value)}
                    style={{width:"100%",padding:"0.7rem 1rem",borderRadius:"12px",border:"1.5px solid rgba(249,161,194,0.3)",background:"#fdf8fa",fontSize:"0.9rem",fontFamily:"inherit",outline:"none"}}
                  />
                </div>
              </div>

              <div style={{marginBottom:"0.75rem"}}>
                <label style={{fontSize:"0.75rem",fontWeight:700,color:"#aaa",letterSpacing:"1px",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Описание (по желание)</label>
                <input
                  type="text"
                  placeholder="напр. Отпуск, Коледни празници..."
                  value={breakLabel}
                  onChange={e => setBreakLabel(e.target.value)}
                  style={{width:"100%",padding:"0.7rem 1rem",borderRadius:"12px",border:"1.5px solid rgba(249,161,194,0.3)",background:"#fdf8fa",fontSize:"0.9rem",fontFamily:"inherit",outline:"none"}}
                />
              </div>

              <button
                className="gift-create-btn"
                onClick={async () => {
                  if (!breakStart || !breakEnd) { setBreakMsg("❌ Избери начална и крайна дата"); return; }
                  if (breakStart > breakEnd) { setBreakMsg("❌ Началната дата трябва да е преди крайната"); return; }
                  const res = await fetch("/api/admin/breaks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ start: breakStart, end: breakEnd, label: breakLabel }),
                  });
                  if (res.ok) {
                    setBreakMsg("✅ Почивката е добавена!");
                    setBreakStart(""); setBreakEnd(""); setBreakLabel("");
                    fetchBreaks();
                  } else {
                    setBreakMsg("❌ Грешка при запазването");
                  }
                  setTimeout(() => setBreakMsg(""), 3000);
                }}
              >
                Добави почивка 🌴
              </button>
              {breakMsg && <div className="gift-msg">{breakMsg}</div>}

              {/* Existing breaks list */}
              {breaks.length > 0 && (
                <div style={{marginTop:"2rem"}}>
                  <h3 style={{fontSize:"0.85rem",fontWeight:700,color:"#aaa",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"1rem"}}>Добавени почивки</h3>
                  <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                    {breaks.map(b => (
                      <div key={b.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(135deg,#fff0f6,#fde8f0)",borderRadius:"14px",padding:"0.9rem 1.2rem",border:"1px solid rgba(249,161,194,0.25)"}}>
                        <div>
                          <div style={{fontWeight:700,color:"#c94090",fontSize:"0.95rem"}}>
                            {b.start.split("-").reverse().join(".")} — {b.end.split("-").reverse().join(".")}
                          </div>
                          {b.label && <div style={{fontSize:"0.8rem",color:"#aaa",marginTop:"2px"}}>{b.label}</div>}
                        </div>
                        <button
                          onClick={async () => {
                            await fetch(`/api/admin/breaks?id=${b.id}`, { method: "DELETE" });
                            fetchBreaks();
                          }}
                          style={{background:"none",border:"none",cursor:"pointer",color:"#e53e3e",fontSize:"1.1rem",padding:"4px 8px",borderRadius:"8px",transition:"background 0.2s"}}
                          title="Изтрий"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {breaks.length === 0 && (
                <p style={{textAlign:"center",color:"#ccc",marginTop:"2rem",fontSize:"0.9rem"}}>Няма добавени почивки</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}