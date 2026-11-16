import Head from "next/head";
import Link from "next/link";

// NOTE for the owner: review this text (especially the retention period and
// contact email) before publishing — it describes how the site works today.
const UPDATED = "15.11.2026";
const CONTACT_EMAIL = "pavlina.dochevaas@gmail.com";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Политика за поверителност – PavNailedIt</title>
        <meta name="description" content="Как PavNailedIt събира и използва личните данни при онлайн резервация." />
      </Head>

      <style jsx>{`
        .page { min-height: 100vh; background: var(--bg); padding: 2rem 1.25rem 5rem; }
        .wrap { max-width: 720px; margin: 0 auto; }
        h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.2rem, 5vw, 3.2rem); font-weight: 400; color: var(--text-dark); margin: 1rem 0 0.5rem; }
        .updated { color: var(--text-mid); font-size: 0.9rem; margin-bottom: 2rem; }
        h2 { font-family: 'DM Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin: 2rem 0 0.6rem; }
        p, li { color: var(--text-mid); line-height: 1.75; font-size: 1rem; }
        ul { padding-left: 1.25rem; margin: 0.5rem 0; }
        li { margin-bottom: 0.35rem; }
        a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
        :global(.back) { display: inline-flex; align-items: center; min-height: 44px; color: var(--text-mid); }
      `}</style>

      <main className="page">
        <div className="wrap">
          <Link href="/" className="back">← Към началото</Link>
          <h1>Политика за поверителност</h1>
          <p className="updated">Последна промяна: {UPDATED}</p>

          <h2>Кой отговаря за данните</h2>
          <p>
            PavNailedIt (Павлина), Пловдив. За въпроси относно личните ти данни пиши на{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> или в Instagram{" "}
            <a href="https://instagram.com/pav.nailed.it" target="_blank" rel="noopener noreferrer">@pav.nailed.it</a>.
          </p>

          <h2>Какви данни събираме</h2>
          <ul>
            <li>Име, телефон и имейл — когато запазваш час или се записваш в чакащ списък.</li>
            <li>Избраните услуги, дата, час и цена на резервацията.</li>
            <li>Снимка на дизайн, ако решиш да качиш такава.</li>
            <li>Код на подаръчна карта, ако използваш такава.</li>
          </ul>
          <p>Не използваме рекламни или проследяващи бисквитки. В браузъра ти пазим само кои часове си запазила от това устройство, за да можеш да ги видиш и отмениш.</p>

          <h2>За какво ги използваме</h2>
          <ul>
            <li>За да запазим, потвърдим, напомним или отменим твоя час (изпълнение на заявката ти).</li>
            <li>За да те уведомим, ако се освободи час, за който чакаш (по твое желание).</li>
          </ul>
          <p>Не продаваме и не споделяме данните ти за маркетинг.</p>

          <h2>Кой друг ги обработва</h2>
          <p>Използваме доверени доставчици, които съхраняват или пренасят данните от наше име:</p>
          <ul>
            <li>Google (Firebase / Firestore — база данни; Gmail — имейли; Google Calendar — графикът на студиото)</li>
            <li>Cloudinary — съхранение на качените снимки</li>
            <li>Vercel — хостинг на сайта</li>
          </ul>

          <h2>Колко време ги пазим</h2>
          <p>Пазим данните за резервацията до 12 месеца след часа, след което ги изтриваме. Ако отмениш час, той се изтрива веднага.</p>

          <h2>Твоите права</h2>
          <p>
            Можеш да поискаш достъп, корекция или изтриване на данните си, както и да оттеглиш съгласието си по всяко време —
            просто ни пиши. Имаш право да подадеш жалба до Комисията за защита на личните данни (
            <a href="https://www.cpdp.bg" target="_blank" rel="noopener noreferrer">cpdp.bg</a>).
          </p>
        </div>
      </main>
    </>
  );
}
