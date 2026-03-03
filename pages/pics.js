import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const NAIL_IMAGES = Array.from({ length: 12 }, (_, i) => ({
  src: `/nails/${Math.floor(i / 3) + 1}/nail${(i % 3) + 1}.jpg`,
  alt: `Nail design ${i + 1}`,
}));

export default function Pics() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      <Head>
        <title>Gallery – PavNailedIt</title>
      </Head>

      <style jsx>{`
        .page { min-height: 100vh; background: var(--bg); padding: 2rem 1.5rem 4rem; }
        .back { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-light); font-size: 0.9rem; margin-bottom: 2rem; transition: color 0.2s; }
        .back:hover { color: var(--pink-deep); }
        h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 300;
          text-align: center;
          color: var(--text-dark);
          margin-bottom: 3rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          max-width: 900px;
          margin: 0 auto;
        }
        @media (min-width: 600px) { .grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 900px) { .grid { grid-template-columns: repeat(4, 1fr); } }
        .img-wrap {
          border-radius: 18px;
          overflow: hidden;
          aspect-ratio: 1;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 4px 15px rgba(249,161,194,0.15);
        }
        .img-wrap:hover { transform: scale(1.04); box-shadow: 0 10px 30px rgba(249,161,194,0.4); }
        .img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(44,26,36,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          cursor: pointer;
          backdrop-filter: blur(8px);
        }
        .lightbox img {
          max-width: 90vw;
          max-height: 85vh;
          border-radius: 20px;
          object-fit: contain;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .close {
          position: fixed;
          top: 1.5rem; right: 2rem;
          font-size: 2rem;
          color: #fff;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
          z-index: 1001;
        }
        .close:hover { opacity: 1; }
      `}</style>

      <div className="page">
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <Link href="/" className="back">← Назад</Link>
        </div>
        <h1>Gallery 💅</h1>

        <div className="grid">
          {NAIL_IMAGES.map((img, i) => (
            <div key={i} className="img-wrap" onClick={() => setLightbox(img.src)}>
              <img src={img.src} alt={img.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <span className="close">&times;</span>
          <img src={lightbox} alt="Nail design large" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
