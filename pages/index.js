import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

const REVIEWS = [
  { text: "Тя е истински професионалист и работи с огромно желание и любов, а резултатите са зашеметяващи! Препоръчвам я с две ръце ❤️❤️", author: "Ивка" },
  { text: "Работи бързо, чисто и с усмивка - винаги си тръгвам доволна!", author: "Цвети" },
  { text: "Професионализъм и креативност, препоръчвам горещо!", author: "Виктория" },
];

const TIPS = [
  "💧 Пий поне 2 литра вода на ден – хидратацията прави ноктите здрави.",
  "🌙 Нанасяй масло за кутикули вечер преди сън.",
  "🥦 Яж храни богати на биотин (яйца, бадеми, броколи) за по-здрави нокти.",
  "🧴 Използвай ръкавици при почистване – препаратите изсушават ноктите.",
  "💅 Давай почивка между гел маникюри за възстановяване на плочката.",
];

function hasActiveBooking() {
  if (typeof window === "undefined") return false;
  const id = localStorage.getItem("pavBooking");
  const date = localStorage.getItem("pavBookingDate");
  const time = localStorage.getItem("pavBookingTime");
  if (!id || !date || !time) return false;
  const [d, m, y] = date.split(".");
  const [hh, mm] = time.split(":");
  const bookingDate = new Date(y, m - 1, d, hh, mm);
  if (new Date() > bookingDate) {
    localStorage.removeItem("pavBooking");
    localStorage.removeItem("pavBookingDate");
    localStorage.removeItem("pavBookingTime");
    return false;
  }
  return true;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [hasBooking, setHasBooking] = useState(false);

  useEffect(() => {
    setHasBooking(hasActiveBooking());
    const onScroll = () => setScrolled(window.scrollY > 150);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleBookClick = (e) => {
    if (hasBooking) {
      e.preventDefault();
      window.location.href = "/already-booked";
    }
  };

  return (
    <>
      <Head>
        <title>PavNailedIt</title>
        <meta name="description" content="Nail salon booking – PavNailedIt" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style jsx>{`
        .page { min-height: 100vh; }

        /* HEADER */
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 3rem;
          position: sticky;
          top: 0;
          background: rgba(253,245,248,0.85);
          backdrop-filter: blur(12px);
          z-index: 100;
          border-bottom: 1px solid rgba(249,161,194,0.2);
        }
        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--pink-deep);
          letter-spacing: 1px;
        }
        nav { display: flex; gap: 2rem; }
        nav a {
          font-size: 0.85rem;
          letter-spacing: 1.5px;
          font-weight: 500;
          color: var(--text-mid);
          transition: color 0.2s;
          text-transform: uppercase;
        }
        nav a:hover { color: var(--pink-deep); }
        .btn-book {
          background: linear-gradient(135deg, var(--pink-soft), var(--pink-mid));
          color: #fff;
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 1px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(249,161,194,0.4);
        }
        .btn-book:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(249,161,194,0.6); }

        /* HERO */
        .hero {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          padding: 4rem 2rem;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(248,183,209,0.3) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-content { position: relative; z-index: 1; max-width: 700px; }
        .hero-eyebrow {
          display: inline-block;
          background: rgba(249,161,194,0.15);
          color: var(--pink-deep);
          padding: 0.4rem 1.2rem;
          border-radius: 50px;
          font-size: 0.8rem;
          letter-spacing: 2px;
          font-weight: 500;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(249,161,194,0.3);
        }
        .hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 300;
          line-height: 1.1;
          color: var(--text-dark);
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
        }
        .hero h1 em { color: var(--pink-deep); font-style: italic; }
        .hero p {
          font-size: 1.1rem;
          color: var(--text-light);
          max-width: 450px;
          margin: 0 auto 2.5rem;
          font-weight: 300;
        }
        .hero-cta {
          display: inline-block;
          background: linear-gradient(135deg, #f8b7d1, #ff6ec4);
          color: #fff;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.3s;
          box-shadow: 0 8px 30px rgba(255,110,196,0.35);
        }
        .hero-cta:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(255,110,196,0.5); }

        /* SECTIONS */
        section { padding: 5rem 2rem; max-width: 1000px; margin: 0 auto; }
        section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 300;
          margin-bottom: 2rem;
          color: var(--text-dark);
        }
        .section-divider {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, var(--pink-soft), var(--pink-deep));
          margin: 0 auto 2rem;
          border-radius: 2px;
        }
        .section-title-wrap { text-align: center; margin-bottom: 3rem; }

        /* ABOUT */
        .about-box {
          background: #fff;
          border-radius: var(--radius);
          padding: 3rem;
          box-shadow: var(--shadow);
          text-align: center;
          border: 1px solid rgba(249,161,194,0.15);
        }
        .about-box p { color: var(--text-mid); font-size: 1.05rem; font-weight: 300; line-height: 1.8; }
        .surprise-box {
          background: linear-gradient(135deg, #fff0f6, #ffe0eb);
          border-radius: 15px;
          padding: 1.5rem 2rem;
          margin-top: 2rem;
          border: 1px solid rgba(249,161,194,0.3);
        }
        .surprise-box h3 {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: var(--pink-deep);
          margin-bottom: 0.5rem;
        }
        .surprise-box p { color: var(--text-mid); font-size: 0.95rem; }

        /* LATE POLICY */
        .policy-box {
          background: #fff;
          border-radius: var(--radius);
          padding: 2.5rem;
          box-shadow: var(--shadow);
          border-left: 4px solid var(--pink-mid);
        }
        .policy-box p { color: var(--text-mid); margin-bottom: 1rem; }
        .policy-box ul { list-style: none; padding: 0; }
        .policy-box li {
          padding: 0.7rem 0;
          border-bottom: 1px solid var(--pink-light);
          color: var(--text-mid);
          font-size: 0.95rem;
        }
        .policy-box li:last-child { border-bottom: none; }

        /* GALLERY */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        @media (min-width: 600px) { .gallery-grid { grid-template-columns: repeat(4, 1fr); } }
        .gallery-img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 15px;
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }
        .gallery-img:hover { transform: scale(1.03); box-shadow: 0 10px 30px rgba(249,161,194,0.4); }
        .see-more {
          display: inline-block;
          border: 2px solid var(--pink-mid);
          color: var(--pink-deep);
          padding: 0.7rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s;
          letter-spacing: 0.5px;
        }
        .see-more:hover { background: var(--pink-mid); color: #fff; }
        .see-more-wrap { text-align: center; }

        /* REVIEWS */
        .reviews-grid { display: grid; gap: 1.5rem; }
        @media (min-width: 700px) { .reviews-grid { grid-template-columns: repeat(3, 1fr); } }
        .review-card {
          background: #fff;
          border-radius: var(--radius);
          padding: 2rem;
          box-shadow: var(--shadow);
          border: 1px solid rgba(249,161,194,0.15);
          transition: transform 0.3s;
        }
        .review-card:hover { transform: translateY(-5px); }
        .review-card p { color: var(--text-mid); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.2rem; font-style: italic; }
        .review-footer { display: flex; justify-content: space-between; align-items: center; }
        .stars { color: var(--pink-deep); font-size: 1rem; }
        .review-author { color: var(--text-light); font-size: 0.85rem; font-weight: 500; }

        /* TIPS */
        .tips-list { list-style: none; display: grid; gap: 1rem; }
        @media (min-width: 600px) { .tips-list { grid-template-columns: repeat(2, 1fr); } }
        .tip-item {
          background: #fff;
          border-radius: 15px;
          padding: 1.2rem 1.5rem;
          font-size: 0.95rem;
          color: var(--text-mid);
          box-shadow: 0 4px 15px rgba(249,161,194,0.1);
          border: 1px solid rgba(249,161,194,0.12);
          transition: transform 0.2s;
        }
        .tip-item:hover { transform: translateY(-3px); }

        /* CONTACT */
        .contact-form { display: grid; gap: 1rem; max-width: 600px; margin: 0 auto; }
        .contact-form input,
        .contact-form textarea {
          width: 100%;
          padding: 0.9rem 1.2rem;
          border-radius: 15px;
          border: 1px solid rgba(249,161,194,0.3);
          background: #fff;
          font-size: 1rem;
          color: var(--text-dark);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .contact-form input:focus,
        .contact-form textarea:focus {
          border-color: var(--pink-mid);
          box-shadow: 0 0 0 3px rgba(249,161,194,0.2);
        }
        .contact-form button {
          background: linear-gradient(135deg, var(--pink-soft), var(--pink-deep));
          color: #fff;
          border: none;
          padding: 1rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 6px 20px rgba(249,161,194,0.4);
        }
        .contact-form button:hover { transform: scale(1.03); box-shadow: 0 10px 30px rgba(249,161,194,0.6); }

        /* FLOATING BUTTON */
        .floating-book {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%) translateY(30px);
          background: linear-gradient(135deg, #f8b7d1, #ff6ec4);
          color: #fff;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: 0.5px;
          box-shadow: 0 10px 35px rgba(255,110,196,0.45);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 999;
          opacity: 0;
          pointer-events: none;
        }
        .floating-book.show {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }
        .floating-book:hover { transform: translateX(-50%) scale(1.07); box-shadow: 0 14px 40px rgba(255,110,196,0.6); }

        /* FOOTER */
        footer {
          text-align: center;
          padding: 3rem 2rem;
          background: rgba(249,161,194,0.08);
          border-top: 1px solid rgba(249,161,194,0.2);
          color: var(--text-light);
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          header { padding: 1rem 1.5rem; }
          nav { display: none; }
          .about-box, .policy-box { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="page">
        <header>
          <div className="logo">PavNailedIt</div>
          <nav>
            <a href="#about">About</a>
            <a href="#gallery">Gallery</a>
            <a href="#reviews">Reviews</a>
            <a href="#contact">Contact</a>
          </nav>
          <Link href="/book" className="btn-book" onClick={handleBookClick}>
            BOOK NOW
          </Link>
        </header>

        {/* HERO */}
        <div className="hero">
          <div className="hero-content">
            <span className="hero-eyebrow">✨ Plovdiv, Bulgaria</span>
            <h1>
              Book your<br /><em>appointment</em> 💅🏻
            </h1>
            <p>Unique, modern nail art designed just for you. Check availability and book your slot.</p>
            <Link href="/book" className="hero-cta" onClick={handleBookClick}>
              Reserve Your Spot
            </Link>
          </div>
        </div>

        {/* ABOUT */}
        <section id="about">
          <div className="section-title-wrap">
            <h2>About</h2>
            <div className="section-divider" />
          </div>
          <div className="about-box">
            <p>Здрасти, аз съм Павлина! Страстен маникюрист, специализиран в модерни, стилни и уникални дизайни на нокти.</p>
            <div className="surprise-box">
              <h3>☕🍫 Ако решиш да ме изненадаш...</h3>
              <p>Обожавам топло <strong>Pumpkin Spice Latte</strong> или <strong>Red Redbull</strong> и понякога нещо сладичко като <strong>черен шоколад</strong>. 💖</p>
            </div>
          </div>
        </section>

        {/* LATE POLICY */}
        <section id="policy">
          <div className="section-title-wrap">
            <h2>⏰ Late Policy</h2>
            <div className="section-divider" />
          </div>
          <div className="policy-box">
            <p>❤️ Обичам да ти подарявам 100% от вниманието си – затова:</p>
            <ul>
              <li><strong>15 минути закъснение</strong> → доплащане 10лв</li>
              <li><strong>20 минути+</strong> → часът се <u>отменя</u> без възстановяване</li>
              <li><strong>3 пъти закъснение</strong> → клиентът <u>повече не се записва</u></li>
            </ul>
            <p style={{marginTop: '1rem'}}>⚠️ Моля те, бъди точна – това е уважение към времето ми и към другите клиенти 💖</p>
          </div>
        </section>

        {/* GALLERY */}
        <section id="gallery">
          <div className="section-title-wrap">
            <h2>Gallery</h2>
            <div className="section-divider" />
          </div>
          <div className="gallery-grid">
            {[1,2,3,4].map(i => (
              <img key={i} src={`/nails/${i}/nail1.jpg`} alt={`Nail design ${i}`} className="gallery-img" />
            ))}
          </div>
          <div className="see-more-wrap">
            <Link href="/pics" className="see-more">SEE MORE &gt;</Link>
          </div>
        </section>

        {/* REVIEWS */}
        <section id="reviews">
          <div className="section-title-wrap">
            <h2>Reviews</h2>
            <div className="section-divider" />
          </div>
          <div className="reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <p>"{r.text}"</p>
                <div className="review-footer">
                  <span className="stars">★★★★★</span>
                  <span className="review-author">— {r.author}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TIPS */}
        <section id="tips">
          <div className="section-title-wrap">
            <h2>🌸 Self-Care Tips</h2>
            <div className="section-divider" />
          </div>
          <ul className="tips-list">
            {TIPS.map((tip, i) => (
              <li key={i} className="tip-item">{tip}</li>
            ))}
          </ul>
        </section>

        {/* CONTACT */}
        <section id="contact">
          <div className="section-title-wrap">
            <h2>Contact</h2>
            <div className="section-divider" />
          </div>
          <p style={{textAlign:'center', color:'var(--text-light)', marginBottom:'2rem'}}>
            Ако имаш въпроси позвъни на <strong>+359 88 123 4567</strong> или се свържи с мен в Instagram <strong>@pavnailedit</strong> 💌
          </p>
          <form className="contact-form" onSubmit={e => e.preventDefault()}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows={5} required />
            <button type="submit">Send Message</button>
          </form>
        </section>

        <footer>
          <p>© 2025 PavNailedIt · <a href="https://instagram.com/pavnailedit" style={{color:'var(--pink-mid)'}}>@pavnailedit</a></p>
        </footer>
      </div>

      {/* FLOATING BOOK BUTTON */}
      <Link href="/book" className={`floating-book ${scrolled ? 'show' : ''}`} onClick={handleBookClick}>
        BOOK NOW 💅
      </Link>
    </>
  );
}
