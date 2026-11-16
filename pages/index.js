import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import dynamic from "next/dynamic";
import heroImg from "../public/nails/3/nail3.jpg";
import { playHeroIntro, glossSweep } from "../lib/heroMotion";

// useLayoutEffect runs before paint (no flash); it is a no-op on the server.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const CircularGallery = dynamic(() => import("../components/CircularGallery"), { ssr: false });

const GALLERY_PREVIEW = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
  image: `/nails/${n}/nail1.jpg`, text: "", alt: `Маникюр ${n}`,
}));

const REVIEWS = [
  { text: "Тя е истински професионалист и работи с огромно желание и любов, а резултатите са зашеметяващи! Препоръчвам я с две ръце ❤️❤️", author: "Ивка" },
  { text: "Работи бързо, чисто и с усмивка - винаги си тръгвам доволна!", author: "Цвети" },
  { text: "Професионализъм и креативност, препоръчвам горещо!", author: "Виктория" },
];

const TIPS = [
  { icon: "water-drop", text: "Пий поне 2 литра вода на ден – хидратацията прави ноктите здрави." },
  { icon: "moon", text: "Нанасяй масло за кутикули вечер преди сън." },
  { icon: "greens", text: "Яж храни богати на биотин (яйца, бадеми, броколи) за по-здрави нокти." },
  { icon: "gloves", text: "Използвай ръкавици при почистване – препаратите изсушават ноктите." },
  { icon: "manicured-hand", text: "Давай почивка между гел маникюри за възстановяване на плочката." },
];

const PHONE_DISPLAY = "+359 87 693 0230";
const PHONE_LINK = "tel:+359876930230";
const INSTAGRAM_URL = "https://instagram.com/pav.nailed.it";

function countUpcomingBookings() {
  try {
    const now = new Date();
    return JSON.parse(localStorage.getItem("pavBookings") || "[]").filter(b => {
      const [d, m, y] = String(b.date).split(".");
      const [hh, mm] = String(b.time).split(":");
      return new Date(y, m - 1, d, hh, mm) > now;
    }).length;
  } catch {
    return 0;
  }
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [upcoming, setUpcoming] = useState(0);
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const ctaGlossRef = useRef(null);

  useIsoLayoutEffect(() => {
    if (!heroRef.current) return;
    return playHeroIntro(heroRef.current);
  }, []);

  useEffect(() => {
    setUpcoming(countUpcomingBookings());
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Parallax writes one CSS variable per frame instead of re-rendering React.
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 300);
        if (!reduced) pageRef.current?.style.setProperty("--scroll", String(Math.min(y, 1200)));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Scroll-reveal; with reduced motion everything is simply visible.
    const els = document.querySelectorAll(".reveal");
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("revealed"));
      return () => window.removeEventListener("scroll", onScroll);
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <Head>
        <title>PavNailedIt – маникюр и nail art в Пловдив</title>
        <meta name="description" content="Модерен гел маникюр и уникален nail art в Пловдив. Разгледай галерията и запази час онлайн за минута." />
        <meta property="og:title" content="PavNailedIt – маникюр в Пловдив" />
        <meta property="og:description" content="Модерен гел маникюр и уникален nail art. Запази час онлайн." />
        <meta property="og:image" content="https://pavnailed.it/nails/3/nail3.jpg" />
        <meta property="og:url" content="https://pavnailed.it/" />
        <link rel="canonical" href="https://pavnailed.it/" />
      </Head>

      <style jsx>{`
        .page {
          --scroll: 0;
          min-height: 100vh;
          background: linear-gradient(160deg, #fff5f8, #fdeef5 40%, #fdf5ee);
        }

        /* ── SCROLL REVEAL ── */
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out); }
        .reveal.revealed { opacity: 1; transform: none; }
        .reveal-delay-1 { transition-delay: 0.08s; }
        .reveal-delay-2 { transition-delay: 0.16s; }
        .reveal-delay-3 { transition-delay: 0.24s; }

        /* ── HEADER ── */
        header {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          padding: 0.9rem 3rem; position: sticky; top: 0; z-index: 100;
          background: rgba(253,245,248,0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(249,161,194,0.2);
        }
        :global(.logo) { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 600; color: var(--accent); letter-spacing: 0.5px; }
        nav { display: flex; gap: 0.5rem; }
        nav a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 0.75rem; font-size: 0.85rem; letter-spacing: 1px; font-weight: 500; color: var(--text-mid); text-transform: uppercase; border-radius: 10px; transition: color 0.2s; }
        nav a:hover { color: var(--accent); }
        .header-actions { display: flex; align-items: center; gap: 0.5rem; }
        :global(.my-bookings) { display: inline-flex; align-items: center; min-height: 44px; padding: 0 0.9rem; font-size: 0.85rem; font-weight: 600; color: var(--accent); border-radius: 999px; border: 1.5px solid rgba(194,24,91,0.35); }
        :global(.btn-pill) {
          display: inline-flex; align-items: center; justify-content: center; min-height: 44px;
          background: var(--accent); color: #fff; padding: 0.7rem 1.8rem; border-radius: 999px;
          font-size: 0.95rem; font-weight: 700; letter-spacing: 1px;
          transition: background 0.2s, transform 0.2s var(--ease-out), box-shadow 0.2s;
          box-shadow: 0 6px 20px rgba(194,24,91,0.28); white-space: nowrap;
        }
        :global(.btn-pill):hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(194,24,91,0.36); color: #fff; }

        /* ── HERO ── */
        .hero {
          display: grid; grid-template-columns: 1.1fr 0.9fr; align-items: center; gap: 4rem;
          max-width: 1120px; margin: 0 auto; min-height: calc(100vh - 80px); padding: 3rem 3rem 4rem;
          position: relative;
        }
        .hero-blob {
          position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
          transform: translateY(calc(var(--scroll) * 0.2px));
        }
        .blob-1 { width: 520px; height: 520px; top: -140px; left: -160px; background: radial-gradient(circle, rgba(249,161,194,0.22) 0%, transparent 70%); }
        .blob-2 { width: 420px; height: 420px; bottom: -80px; right: -120px; background: radial-gradient(circle, rgba(255,110,196,0.12) 0%, transparent 70%); transform: translateY(calc(var(--scroll) * -0.12px)); }
        .hero-content { position: relative; z-index: 1; }
        .hero h1 {
          font-family: 'Cormorant Garamond', serif; font-size: clamp(3rem, 7vw, 5.6rem);
          font-weight: 300; line-height: 1.02; color: var(--text-dark); margin-bottom: 1.5rem; letter-spacing: -0.02em;
          text-wrap: balance;
        }
        .hero h1 em { color: var(--accent); font-style: italic; }
        .hero-lead { font-size: 1.15rem; color: var(--text-mid); max-width: 30rem; margin-bottom: 2.25rem; line-height: 1.7; }
        .hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.5rem; }
        :global(.hero-cta) {
          display: inline-flex; align-items: center; justify-content: center; min-height: 60px;
          background: var(--accent); color: #fff; padding: 1.1rem 3.2rem; border-radius: 999px;
          font-size: 1.15rem; font-weight: 700; letter-spacing: 1.5px;
          transition: background 0.2s, transform 0.25s var(--ease-out), box-shadow 0.25s;
          box-shadow: 0 12px 34px rgba(194,24,91,0.32);
        }
        :global(.hero-cta):hover { background: var(--accent-hover); transform: translateY(-3px); box-shadow: 0 18px 44px rgba(194,24,91,0.4); color: #fff; }
        :global(.hero-link) { display: inline-flex; align-items: center; min-height: 44px; color: var(--text-mid); font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
        :global(.hero-link):hover { color: var(--accent); }
        .hero-place { margin-top: 2rem; font-size: 0.95rem; color: var(--text-light); }
        .hero-photo {
          position: relative; z-index: 1; border-radius: 220px 220px 28px 28px; overflow: hidden;
          aspect-ratio: 4 / 5; box-shadow: 0 30px 60px rgba(150,60,100,0.22);
          background: #f6dde7; /* the "bare nail" the polish is brushed onto */
          transform: translateY(calc(var(--scroll) * -0.06px));
        }
        .hero-photo-clip { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; }
        .hero-photo-inner { position: absolute; inset: 0; transform-origin: 50% 80%; }
        .gloss {
          position: absolute; top: -10%; bottom: -10%; left: -55%; width: 40%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
          pointer-events: none; visibility: hidden; mix-blend-mode: soft-light;
        }
        /* Headline words rise out of their own line */
        .w { display: inline-block; overflow: hidden; vertical-align: top; padding: 0 0.08em 0.1em; margin: 0 -0.08em -0.1em; }
        .word { display: inline-block; }
        :global(.hero-cta) { position: relative; overflow: hidden; isolation: isolate; }
        :global(.cta-gloss) {
          position: absolute; top: 0; bottom: 0; left: 0; width: 45%; z-index: -1;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0));
          pointer-events: none; visibility: hidden;
        }
        @media (max-width: 860px) {
          .hero { grid-template-columns: 1fr; gap: 2.5rem; min-height: 0; padding: 2.5rem 1.25rem 3.5rem; text-align: center; }
          .hero-lead { margin-left: auto; margin-right: auto; }
          .hero-actions { justify-content: center; }
          .hero-photo { max-width: 360px; width: 100%; margin: 0 auto; border-radius: 180px 180px 24px 24px; }
        }

        /* ── SECTIONS ── */
        section { padding: 5rem 2rem; max-width: 1000px; margin: 0 auto; }
        section h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.2rem, 4vw, 3.5rem); font-weight: 300; margin-bottom: 1rem; color: var(--text-dark); }
        .section-divider { width: 60px; height: 2px; background: var(--pink-mid); margin: 0 auto; border-radius: 2px; }
        .section-title-wrap { text-align: center; margin-bottom: 3rem; }

        .about-box { background: #fff; border-radius: var(--radius); padding: 3rem; box-shadow: var(--shadow); text-align: center; border: 1px solid rgba(249,161,194,0.15); }
        .about-box p { color: var(--text-mid); font-size: 1.1rem; line-height: 1.8; max-width: 60ch; margin: 0 auto; }
        .surprise-box { background: linear-gradient(135deg, #fff0f6, #ffe0eb); border-radius: 15px; padding: 1.5rem 2rem; margin-top: 2rem; }
        .surprise-box h3 { font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700; color: var(--accent); margin-bottom: 0.5rem; }
        .surprise-box p { font-size: 0.98rem; }

        .policy-box { background: #fff; border-radius: var(--radius); padding: 2.5rem; box-shadow: var(--shadow); border: 1px solid rgba(249,161,194,0.2); }
        .policy-box p { color: var(--text-mid); margin-bottom: 1rem; }
        .policy-box ul { list-style: none; padding: 0; }
        .policy-box li { padding: 0.8rem 0; border-bottom: 1px solid var(--pink-light); color: var(--text-mid); font-size: 1rem; }
        .policy-box li:last-child { border-bottom: none; }

        .gallery-3d-wrap { height: 480px; position: relative; margin-bottom: 2rem; border-radius: 20px; overflow: hidden; }
        @media (max-width: 768px) { .gallery-3d-wrap { height: 340px; } }
        .see-more-wrap { text-align: center; }
        :global(.see-more) { display: inline-flex; align-items: center; min-height: 48px; border: 2px solid var(--accent); color: var(--accent); padding: 0.7rem 2rem; border-radius: 50px; font-weight: 600; font-size: 0.95rem; transition: background 0.2s, color 0.2s; }
        :global(.see-more):hover { background: var(--accent); color: #fff; }

        .reviews-grid { display: grid; gap: 1.5rem; }
        @media (min-width: 700px) { .reviews-grid { grid-template-columns: repeat(3, 1fr); } }
        .review-card { background: #fff; border-radius: var(--radius); padding: 2rem; box-shadow: var(--shadow); border: 1px solid rgba(249,161,194,0.15); margin: 0; }
        .review-card blockquote { color: var(--text-mid); font-size: 1rem; line-height: 1.7; margin: 0 0 1.2rem; font-style: italic; }
        .review-card figcaption { display: flex; justify-content: space-between; align-items: center; }
        .stars { color: var(--accent); font-size: 1rem; }
        .review-author { color: var(--text-mid); font-size: 0.9rem; font-weight: 600; }

        .tips-list { list-style: none; display: grid; gap: 1rem; padding: 0; }
        @media (min-width: 600px) { .tips-list { grid-template-columns: repeat(2, 1fr); } }
        .tip-item { display: flex; align-items: center; gap: 1rem; background: #fff; border-radius: 15px; padding: 1.1rem 1.4rem; font-size: 1rem; color: var(--text-mid); box-shadow: 0 4px 15px rgba(249,161,194,0.1); border: 1px solid rgba(249,161,194,0.12); }
        .art-icon { width: 40px; height: 40px; object-fit: contain; flex-shrink: 0; }
        .art-inline { width: 28px; height: 28px; object-fit: contain; vertical-align: -7px; margin: 0 0.15rem; }
        .with-icon .art-inline { margin-right: 0.35rem; }
        .contact-art { display: block; width: 72px; height: 72px; object-fit: contain; margin: -1rem auto 1.5rem; }

        .contact-lead { text-align: center; color: var(--text-mid); margin: 0 auto 2rem; max-width: 50ch; font-size: 1.05rem; }
        .contact-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
        .contact-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 52px; padding: 0.9rem 1.8rem; border-radius: 999px; font-weight: 700; font-size: 1rem; transition: background 0.2s, color 0.2s, transform 0.2s var(--ease-out); }
        .contact-btn.primary { background: var(--accent); color: #fff; }
        .contact-btn.primary:hover { background: var(--accent-hover); transform: translateY(-2px); }
        .contact-btn.secondary { border: 2px solid var(--accent); color: var(--accent); background: #fff; }
        .contact-btn.secondary:hover { background: var(--pink-light); }

        :global(.floating-book) {
          position: fixed; bottom: 24px; left: 50%; z-index: 999;
          transform: translateX(-50%) translateY(90px); opacity: 0; visibility: hidden;
          display: inline-flex; align-items: center; min-height: 56px;
          background: var(--accent); color: #fff; padding: 1rem 2.6rem; border-radius: 999px;
          font-weight: 700; font-size: 1.05rem; letter-spacing: 1.5px; white-space: nowrap;
          box-shadow: 0 10px 32px rgba(194,24,91,0.4);
          transition: transform 0.4s var(--ease-out), opacity 0.3s, visibility 0s linear 0.4s, background 0.2s;
        }
        :global(.floating-book.show) { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); transition: transform 0.4s var(--ease-out), opacity 0.3s, background 0.2s; }
        :global(.floating-book):hover { background: var(--accent-hover); color: #fff; }

        footer { text-align: center; padding: 3rem 2rem 6rem; background: rgba(249,161,194,0.08); border-top: 1px solid rgba(249,161,194,0.2); color: var(--text-mid); font-size: 0.9rem; }
        footer :global(a) { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; display: inline-flex; min-height: 44px; align-items: center; padding: 0 0.25rem; }

        @media (max-width: 768px) {
          header { padding: 0.75rem 1rem; }
          nav { display: none; }
          :global(.logo) { font-size: 1.5rem; }
          .about-box, .policy-box { padding: 2rem 1.5rem; }
          :global(.btn-pill) { padding: 0.65rem 1.2rem; font-size: 0.88rem; }
          :global(.my-bookings) { display: none; }
          section { padding: 4rem 1.25rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .hero-blob, .hero-photo { transform: none; }
        }
      `}</style>

      <div className="page" ref={pageRef}>
        <header>
          <Link href="/" className="logo" aria-label="PavNailedIt – начало">PavNailedIt</Link>
          <nav aria-label="Основна навигация">
            <a href="#about">За мен</a>
            <a href="#gallery">Галерия</a>
            <a href="#reviews">Отзиви</a>
            <a href="#contact">Контакт</a>
          </nav>
          <div className="header-actions">
            {upcoming > 0 && <Link href="/already-booked" className="my-bookings">Моите часове ({upcoming})</Link>}
            <Link href="/book" className="btn-pill">Запази час</Link>
          </div>
        </header>

        <main>
          <div className="hero" ref={heroRef}>
            <div className="hero-blob blob-1" aria-hidden="true" />
            <div className="hero-blob blob-2" aria-hidden="true" />
            <div className="hero-content">
              <h1>
                <span className="w"><span className="word" data-anim>Маникюр,</span></span>{" "}
                <span className="w"><em className="word" data-anim>създаден</em></span>{" "}
                <span className="w"><span className="word" data-anim>за</span></span>{" "}
                <span className="w"><span className="word" data-anim>теб</span></span>
              </h1>
              <p className="hero-lead rise" data-anim>Модерен гел маникюр и уникален nail art. Виж свободните часове и запази своя за минута.</p>
              <div className="hero-actions rise" data-anim>
                <Link href="/book" className="hero-cta" onMouseEnter={() => glossSweep(ctaGlossRef.current)} onFocus={() => glossSweep(ctaGlossRef.current)}>
                  <span className="cta-label">Запази час</span>
                  <span className="cta-gloss" ref={ctaGlossRef} aria-hidden="true" />
                </Link>
                <Link href="/pics" className="hero-link">Разгледай галерията</Link>
              </div>
              <p className="hero-place rise" data-anim>Пловдив · по предварителна резервация</p>
            </div>
            <div className="hero-photo" data-anim>
              <div className="hero-photo-clip">
                <div className="hero-photo-inner">
                  <Image
                    src={heroImg}
                    alt="Бадемовидни нокти с жълт френски маникюр и розови 3D цветя"
                    fill
                    priority
                    placeholder="blur"
                    sizes="(max-width: 860px) 360px, 480px"
                    style={{ objectFit: "cover", objectPosition: "50% 20%" }}
                  />
                </div>
                <span className="gloss" aria-hidden="true" />
              </div>
            </div>
          </div>

          <section id="about">
            <div className="section-title-wrap reveal">
              <h2>За мен</h2>
              <div className="section-divider" />
            </div>
            <div className="about-box reveal reveal-delay-1">
              <p>Здрасти, аз съм Павлина! Страстен маникюрист, специализиран в модерни, стилни и уникални дизайни на нокти.</p>
              <div className="surprise-box">
                <h3>
                  Ако решиш да ме изненадаш...
                  <img className="art-inline" src="/art/icons/coffee.webp" alt="" width="28" height="28" loading="lazy" />
                  <img className="art-inline" src="/art/icons/chocolate.webp" alt="" width="28" height="28" loading="lazy" />
                </h3>
                <p>Обожавам топло <strong>Pumpkin Spice Latte</strong> или <strong>Red Redbull</strong> и понякога нещо сладичко като <strong>черен шоколад</strong>. 💖</p>
              </div>
            </div>
          </section>

          <section id="policy">
            <div className="section-title-wrap reveal">
              <h2>Правила за закъснение</h2>
              <div className="section-divider" />
            </div>
            <div className="policy-box reveal reveal-delay-1">
              <p className="with-icon"><img className="art-inline" src="/art/icons/heart-badge.webp" alt="" width="28" height="28" loading="lazy" /> Обичам да ти подарявам 100% от вниманието си – затова:</p>
              <ul>
                <li><strong>10 минути закъснение</strong> → доплащане 5€</li>
                <li><strong>20 минути+</strong> → часът се <u>отменя</u> без възстановяване</li>
                <li><strong>3 пъти закъснение</strong> → клиентът <u>повече не се записва</u></li>
              </ul>
              <p className="with-icon" style={{ marginTop: "1rem" }}><img className="art-inline" src="/art/icons/clock.webp" alt="" width="28" height="28" loading="lazy" /> Моля те, бъди точна – това е уважение към времето ми и към другите клиенти 💖</p>
            </div>
          </section>

          <section id="gallery">
            <div className="section-title-wrap reveal">
              <h2>Галерия</h2>
              <div className="section-divider" />
            </div>
            <div className="gallery-3d-wrap reveal reveal-delay-1">
              <CircularGallery items={GALLERY_PREVIEW} bend={1} textColor="#ffffff" borderRadius={0.05} scrollSpeed={1.6} scrollEase={0.05} />
            </div>
            <div className="see-more-wrap">
              <Link href="/pics" className="see-more">Виж всички снимки →</Link>
            </div>
          </section>

          <section id="reviews">
            <div className="section-title-wrap reveal">
              <h2>Отзиви</h2>
              <div className="section-divider" />
            </div>
            <div className="reviews-grid">
              {REVIEWS.map((r, i) => (
                <figure key={i} className={`review-card reveal reveal-delay-${i + 1}`}>
                  <blockquote>„{r.text}“</blockquote>
                  <figcaption>
                    <span className="stars" aria-label="5 от 5 звезди">★★★★★</span>
                    <span className="review-author">— {r.author}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section id="tips">
            <div className="section-title-wrap reveal">
              <h2>Съвети за грижа</h2>
              <div className="section-divider" />
            </div>
            <ul className="tips-list">
              {TIPS.map((tip, i) => (
                <li key={i} className={`tip-item reveal reveal-delay-${(i % 3) + 1}`}>
                  <img className="art-icon" src={`/art/icons/${tip.icon}.webp`} alt="" width="40" height="40" loading="lazy" decoding="async" />
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="contact">
            <div className="section-title-wrap reveal">
              <h2>Контакт</h2>
              <div className="section-divider" />
            </div>
            <p className="contact-lead">Имаш въпрос? Обади ми се или ми пиши в Instagram — отговарям възможно най-бързо.</p>
            <img className="contact-art" src="/art/icons/love-letter.webp" alt="" width="72" height="72" loading="lazy" />
            <div className="contact-actions">
              <a className="contact-btn primary" href={PHONE_LINK}>Обади се: {PHONE_DISPLAY}</a>
              <a className="contact-btn secondary" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram @pav.nailed.it</a>
            </div>
          </section>
        </main>

        <footer>
          <p>
            © {new Date().getFullYear()} PavNailedIt ·{" "}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@pav.nailed.it</a> ·{" "}
            <Link href="/aftercare">Грижа за ноктите</Link> ·{" "}
            <Link href="/privacy">Поверителност</Link>
          </p>
        </footer>
      </div>

      <Link
        href="/book"
        className={`floating-book ${scrolled ? "show" : ""}`}
        aria-hidden={!scrolled}
        tabIndex={scrolled ? 0 : -1}
      >
        Запази час
      </Link>
    </>
  );
}
