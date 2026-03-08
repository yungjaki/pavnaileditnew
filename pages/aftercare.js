import Head from "next/head";
import Link from "next/link";

const TIPS = [
  {
    icon: "💧",
    time: "Първите 2 часа",
    title: "Без вода",
    desc: "Избягвай да мокриш ноктите поне 2 часа след процедурата. Гелът продължава да се втвърдява и водата може да наруши адхезията.",
    color: "#e8f4fd",
    accent: "#5ba3d9",
  },
  {
    icon: "🧴",
    time: "Ежедневно",
    title: "Хидратирай кутикулите",
    desc: "Нанасяй масло за кутикули всяка вечер. Хидратираните кутикули = по-дълготрайни нокти. Препоръчваме масло с витамин Е или бадемово масло.",
    color: "#fdf5e8",
    accent: "#d4924a",
  },
  {
    icon: "🧤",
    time: "При почистване",
    title: "Защити ноктите",
    desc: "Носи ръкавици при работа с препарати за почистване, съдомиялна или химикали. Агресивните вещества съкращават живота на гела значително.",
    color: "#f0fdf4",
    accent: "#4a9d6f",
  },
  {
    icon: "✋",
    time: "Винаги",
    title: "Без отчупване",
    desc: "Не използвай ноктите за отваряне на кутии, скрепване и подобни. Натискът под ъгъл е причина №1 за отчупване. Използвай подложката на пръста.",
    color: "#fdf0f8",
    accent: "#c94090",
  },
  {
    icon: "☀️",
    time: "На слънце",
    title: "Слънцезащита",
    desc: "UV лъчите избледняват цветовете с времето. При продължително излагане на слънце, нанеси слънцезащитен крем и върху ръцете.",
    color: "#fffbeb",
    accent: "#d4a017",
  },
  {
    icon: "🪮",
    time: "При проблем",
    title: "Не сваляй сама",
    desc: "Ако се наруши нокът или гелът се повдигне — не го дърпай! Свали се при специалист. Само така запазваш естествения нокът без увреждания.",
    color: "#fef2f2",
    accent: "#e53e3e",
  },
];

const FAQ = [
  {
    q: "Колко дълго издържа гел маникюрът?",
    a: "При правилна грижа — 3 до 4 седмици. Ключово е да хидратираш кутикулите редовно и да избягваш агресивни препарати.",
  },
  {
    q: "Могат ли ноктите ми да \"дишат\" между процедурите?",
    a: "Ноктите не дишат — те не са живи тъкани. Почивките между процедурите не са задължителни за здравето им. По-важно е качественото нанасяне и свалянето.",
  },
  {
    q: "Защо се повдига гелът при мен?",
    a: "Най-честите причини: мазна кожа върху нокътната плоча при нанасянето, контакт с вода в първите часове, или агресивни химикали при почистване.",
  },
  {
    q: "Кога да запиша следващ час?",
    a: "Препоръчваме след 3-4 седмици — тогава новорасналата основа е видима и е идеалното време за поддръжка или смяна.",
  },
];

export default function Aftercare() {
  return (
    <>
      <Head>
        <title>Грижа за ноктите – PavNailedIt</title>
        <meta name="description" content="Как да се грижиш за гел маникюра си — съвети от PavNailedIt" />
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdfaf8; font-family: 'DM Sans', sans-serif; }

        .ac-page { min-height: 100vh; }

        /* ── Hero ── */
        .ac-hero {
          position: relative;
          background: linear-gradient(160deg, #fff5f0 0%, #fde8d8 50%, #fdf0e8 100%);
          padding: 3rem 1.5rem 4rem;
          text-align: center;
          overflow: hidden;
        }
        .ac-hero::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(249,161,194,0.15), transparent 70%);
          border-radius: 50%;
        }
        .ac-hero::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(212,168,100,0.12), transparent 70%);
          border-radius: 50%;
        }
        .ac-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: #b8a898; font-size: 0.85rem; text-decoration: none;
          margin-bottom: 2.5rem; transition: color 0.2s; position: relative; z-index: 1;
        }
        .ac-back:hover { color: #8b6f5e; }
        .ac-hero-icon {
          font-size: 3rem; display: block; margin-bottom: 1rem;
          animation: floatIcon 3s ease-in-out infinite;
          position: relative; z-index: 1;
        }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .ac-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.2rem, 6vw, 3.5rem);
          font-weight: 300;
          color: #5c3d2e;
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 1rem;
          position: relative; z-index: 1;
        }
        .ac-hero h1 em { color: #c9956e; font-style: italic; }
        .ac-hero-sub {
          font-size: 1rem; color: #9c7c6a; max-width: 420px;
          margin: 0 auto; line-height: 1.7; position: relative; z-index: 1;
        }

        /* ── Tips grid ── */
        .ac-section { max-width: 720px; margin: 0 auto; padding: 3rem 1.5rem; }
        .ac-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem; font-weight: 400; color: #5c3d2e;
          margin-bottom: 0.5rem;
        }
        .ac-section-sub { font-size: 0.88rem; color: #b8a898; margin-bottom: 2rem; }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 520px) { .tips-grid { grid-template-columns: 1fr; } }

        .tip-card {
          border-radius: 20px;
          padding: 1.5rem;
          border: 1.5px solid rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .tip-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        .tip-card::before {
          content: '';
          position: absolute;
          top: -20px; right: -20px;
          width: 80px; height: 80px;
          border-radius: 50%;
          opacity: 0.4;
        }
        .tip-time {
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .tip-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .tip-icon { font-size: 1.6rem; flex-shrink: 0; }
        .tip-title { font-size: 1rem; font-weight: 700; color: #4a3228; }
        .tip-desc { font-size: 0.85rem; color: #7a6050; line-height: 1.65; }

        /* ── Timeline ── */
        .ac-timeline { max-width: 720px; margin: 0 auto; padding: 0 1.5rem 3rem; }
        .timeline-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem; font-weight: 400; color: #5c3d2e; margin-bottom: 2rem;
        }
        .timeline { position: relative; padding-left: 32px; }
        .timeline::before {
          content: '';
          position: absolute;
          left: 10px; top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, #f8b7d1, #d4a882, #c9956e);
          border-radius: 1px;
        }
        .tl-item { position: relative; margin-bottom: 2rem; }
        .tl-dot {
          position: absolute;
          left: -26px; top: 4px;
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 2.5px solid #fff;
          box-shadow: 0 0 0 2px;
        }
        .tl-time { font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .tl-text { font-size: 0.9rem; color: #7a6050; line-height: 1.6; }
        .tl-text strong { color: #4a3228; }

        /* ── FAQ ── */
        .ac-faq { max-width: 720px; margin: 0 auto; padding: 0 1.5rem 4rem; }
        .faq-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem; font-weight: 400; color: #5c3d2e; margin-bottom: 1.5rem;
        }
        .faq-item {
          border-radius: 16px;
          border: 1.5px solid rgba(220,190,160,0.3);
          background: #fdfaf8;
          padding: 1.25rem 1.5rem;
          margin-bottom: 12px;
          transition: box-shadow 0.2s;
        }
        .faq-item:hover { box-shadow: 0 4px 16px rgba(180,140,100,0.1); }
        .faq-q { font-size: 0.95rem; font-weight: 700; color: #5c3d2e; margin-bottom: 8px; }
        .faq-q::before { content: 'Q  '; color: #c9956e; font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; }
        .faq-a { font-size: 0.88rem; color: #8a7060; line-height: 1.65; }

        /* ── CTA ── */
        .ac-cta {
          background: linear-gradient(135deg, #fde8d8, #f5d0bc);
          padding: 3rem 1.5rem;
          text-align: center;
        }
        .ac-cta h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 300; color: #5c3d2e; margin-bottom: 0.75rem;
        }
        .ac-cta p { color: #9c7c6a; font-size: 0.95rem; margin-bottom: 1.5rem; }
        .ac-cta-btn {
          display: inline-block;
          background: linear-gradient(135deg, #f8b7d1, #ff6ec4);
          color: #fff;
          padding: 0.9rem 2.5rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(255,110,196,0.35);
          transition: all 0.3s;
        }
        .ac-cta-btn:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(255,110,196,0.5); }
      `}</style>

      <div className="ac-page">
        {/* Hero */}
        <div className="ac-hero">
          <Link href="/" className="ac-back">← Към началото</Link>
          <span className="ac-hero-icon">💅</span>
          <h1>Грижа за твоите<br /><em>нокти</em></h1>
          <p className="ac-hero-sub">
            Следвай тези съвети и гел маникюрът ти ще издържи максимално дълго — красив и непокътнат.
          </p>
        </div>

        {/* Tips */}
        <div className="ac-section">
          <h2 className="ac-section-title">Основни правила</h2>
          <p className="ac-section-sub">6 навика, които правят разлика</p>
          <div className="tips-grid">
            {TIPS.map((tip, i) => (
              <div key={i} className="tip-card" style={{ background: tip.color }}>
                <div className="tip-time" style={{ color: tip.accent }}>{tip.time}</div>
                <div className="tip-header">
                  <span className="tip-icon">{tip.icon}</span>
                  <span className="tip-title">{tip.title}</span>
                </div>
                <p className="tip-desc">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="ac-timeline">
          <h2 className="timeline-title">График на грижите</h2>
          <div className="timeline">
            {[
              { color: "#f8b7d1", shadow: "#f8b7d1", time: "Веднага след процедурата", text: <><strong>Не мокри ноктите</strong> поне 2 часа. Избягвай горещ душ, съдове и почистване.</> },
              { color: "#ffd6a0", shadow: "#ffd6a0", time: "Първата вечер", text: <><strong>Нанеси масло за кутикули.</strong> Масажирай леко около нокътя. Така започва правилната грижа от ден 1.</> },
              { color: "#a8d8a8", shadow: "#a8d8a8", time: "Всяка вечер", text: <>По <strong>1-2 капки масло</strong> за кутикули. Отнема 30 секунди и удвоява живота на маникюра.</> },
              { color: "#c9956e", shadow: "#c9956e", time: "При почистване", text: <><strong>Ръкавици.</strong> Препаратите за почистване са враг №1 на гела.</> },
              { color: "#b8a0d8", shadow: "#b8a0d8", time: "След 3–4 седмици", text: <>Запиши следващ <strong>час за поддръжка или смяна.</strong> Не чакай гелът да се вдигне сам.</> },
            ].map((item, i) => (
              <div key={i} className="tl-item">
                <div className="tl-dot" style={{ background: item.color, boxShadow: `0 0 0 2px ${item.shadow}` }} />
                <div className="tl-time" style={{ color: item.color === "#fdfaf8" ? "#c9956e" : item.color }}>{item.time}</div>
                <p className="tl-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="ac-faq">
          <h2 className="faq-title">Често задавани въпроси</h2>
          {FAQ.map((item, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q">{item.q}</div>
              <p className="faq-a">{item.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="ac-cta">
          <h2>Готова за следващия час?</h2>
          <p>Запази онлайн за секунди — без телефонни обаждания.</p>
          <Link href="/book" className="ac-cta-btn">Запази час 💅</Link>
        </div>
      </div>
    </>
  );
}
