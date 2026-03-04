import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function AlreadyBooked() {
  const router = useRouter();
  const [bookingInfo, setBookingInfo] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const isSuccess = router.query.success === "true";

  useEffect(() => {
    const id   = localStorage.getItem("pavBooking");
    const date = localStorage.getItem("pavBookingDate");
    const time = localStorage.getItem("pavBookingTime");
    if (date && time) setBookingInfo({ id, date, time });
  }, []);

  const handleCancel = async () => {
    if (!confirm("Сигурна ли си, че искаш да отмениш часа?")) return;
    setCancelling(true);
    const id = localStorage.getItem("pavBooking");
    if (id) {
      try {
        await fetch(`/api/book?id=${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Cancel error:", e);
      }
    }
    localStorage.removeItem("pavBooking");
    localStorage.removeItem("pavBookingDate");
    localStorage.removeItem("pavBookingTime");
    setCancelling(false);
    setCancelled(true);
    setTimeout(() => router.push("/"), 2000);
  };

  if (cancelled) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"3rem"}}>✅</div>
          <p style={{color:"var(--text-light)",marginTop:"1rem"}}>Резервацията е отменена. Пренасочване...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{isSuccess ? "Часът е запазен! 💅" : "Вече имаш час"} – PavNailedIt</title>
      </Head>

      <style jsx>{`
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 2rem; }
        .card { max-width: 480px; width: 100%; background: #fff; border-radius: 28px; padding: 3rem 2.5rem; text-align: center; box-shadow: 0 20px 60px rgba(249,161,194,0.2); border: 1px solid rgba(249,161,194,0.15); }
        .emoji { font-size: 4rem; margin-bottom: 1rem; display: block; }
        h1 { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 400; color: var(--text-dark); margin-bottom: 0.75rem; }
        p { color: var(--text-light); line-height: 1.7; margin-bottom: 1rem; }
        .booking-box { background: linear-gradient(135deg, #fff0f6, #fde8f0); border-radius: 18px; padding: 1.5rem; margin: 1.5rem 0; border: 1px solid rgba(249,161,194,0.3); }
        .booking-box h3 { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); margin-bottom: 0.5rem; }
        .booking-date { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 600; color: var(--pink-deep); }
        .booking-time { font-size: 1rem; color: var(--text-mid); margin-top: 0.25rem; }
        .btn-home { display: inline-block; background: linear-gradient(135deg, #f8b7d1, #ff6ec4); color: #fff; padding: 0.9rem 2.5rem; border-radius: 50px; font-weight: 600; font-size: 1rem; margin-top: 0.5rem; transition: all 0.3s; box-shadow: 0 6px 20px rgba(255,110,196,0.35); }
        .btn-home:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(255,110,196,0.5); }
        .btn-cancel { display: block; margin: 1rem auto 0; background: none; border: none; color: var(--text-light); font-size: 0.85rem; cursor: pointer; text-decoration: underline; transition: color 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn-cancel:hover { color: #e53e3e; }
        .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="page">
        <div className="card">
          <span className="emoji">{isSuccess ? "🎉" : "💅"}</span>
          <h1>{isSuccess ? "Часът е запазен!" : "Вече имаш запазен час"}</h1>

          {isSuccess ? (
            <p>Изпратихме ти имейл с потвърждение. Очаквам те! 🌸</p>
          ) : (
            <p>Имаш активна резервация при мен. Ако искаш да промениш нещо, свържи се с мен.</p>
          )}

          {bookingInfo && (
            <div className="booking-box">
              <h3>Твоят час</h3>
              <div className="booking-date">{bookingInfo.date}</div>
              <div className="booking-time">в {bookingInfo.time}</div>
            </div>
          )}

          <Link href="/" className="btn-home">← Обратно към началото</Link>

          <button className="btn-cancel" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Отменя се..." : "Отмени резервацията"}
          </button>
        </div>
      </div>
    </>
  );
}