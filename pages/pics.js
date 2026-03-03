import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

// Each folder with its images — first image is the grid preview
const FOLDERS = [
  { id: 1,  images: ["/nails/1/nail1.jpg",  "/nails/1/nail2.jpg",  "/nails/1/nail3.jpg"] },
  { id: 2,  images: ["/nails/2/nail1.jpg",  "/nails/2/nail2.jpg",  "/nails/2/nail3.jpg"] },
  { id: 3,  images: ["/nails/3/nail1.jpg",  "/nails/3/nail2.jpg",  "/nails/3/nail3.jpg"] },
  { id: 4,  images: ["/nails/4/nail1.jpg",  "/nails/4/nail2.jpg"] },
  { id: 5,  images: ["/nails/5/nail1.jpg",  "/nails/5/nail2.jpg"] },
  { id: 6,  images: ["/nails/6/nail1.jpg",  "/nails/6/nail2.jpg"] },
  { id: 7,  images: ["/nails/7/nail1.jpg",  "/nails/7/nail2.jpg",  "/nails/7/nail3.jpg"] },
  { id: 8,  images: ["/nails/8/nail1.jpg",  "/nails/8/nail2.jpg"] },
  { id: 9,  images: ["/nails/9/nail1.jpg",  "/nails/9/nail2.jpg"] },
  { id: 10, images: ["/nails/10/nail1.jpg", "/nails/10/nail2.jpg"] },
  { id: 11, images: ["/nails/11/nail1.jpg", "/nails/11/nail2.jpg"] },
  { id: 12, images: ["/nails/12/nail1.jpg", "/nails/12/nail2.jpg"] },
  { id: 13, images: ["/nails/13/nail1.jpg"] },
];

export default function Pics() {
  // lightbox state: which folder is open + which image index
  const [lightbox, setLightbox] = useState(null); // { folderIndex, imgIndex }

  const openLightbox = (folderIndex, imgIndex = 0) => {
    setLightbox({ folderIndex, imgIndex });
  };
  const closeLightbox = () => setLightbox(null);

  const prev = useCallback(() => {
    if (!lightbox) return;
    const folder = FOLDERS[lightbox.folderIndex];
    setLightbox(lb => ({
      ...lb,
      imgIndex: (lb.imgIndex - 1 + folder.images.length) % folder.images.length,
    }));
  }, [lightbox]);

  const next = useCallback(() => {
    if (!lightbox) return;
    const folder = FOLDERS[lightbox.folderIndex];
    setLightbox(lb => ({
      ...lb,
      imgIndex: (lb.imgIndex + 1) % folder.images.length,
    }));
  }, [lightbox]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, next, prev]);

  const currentFolder = lightbox ? FOLDERS[lightbox.folderIndex] : null;
  const currentImg = currentFolder ? currentFolder.images[lightbox.imgIndex] : null;
  const hasMultiple = currentFolder && currentFolder.images.length > 1;

  return (
    <>
      <Head>
        <title>Gallery – PavNailedIt</title>
      </Head>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: var(--bg);
        }

        /* HEADER */
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.2rem 3rem;
          background: rgba(253,245,248,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(249,161,194,0.2);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--pink-deep);
          text-decoration: none;
        }
        .back {
          color: var(--text-light);
          font-size: 0.9rem;
          transition: color 0.2s;
          text-decoration: none;
        }
        .back:hover { color: var(--pink-deep); }

        /* HERO */
        .hero {
          text-align: center;
          padding: 3.5rem 2rem 2rem;
        }
        .hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 300;
          color: var(--text-dark);
          letter-spacing: -1px;
        }
        .hero h1 em { color: var(--pink-deep); font-style: italic; }
        .hero p {
          color: var(--text-light);
          margin-top: 0.6rem;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }

        /* GRID */
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          padding: 2rem;
          max-width: 1100px;
          margin: 0 auto 4rem;
        }
        @media (min-width: 500px)  { .grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 800px)  { .grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1100px) { .grid { grid-template-columns: repeat(5, 1fr); } }

        .grid-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(249,161,194,0.15);
          transition: transform 0.3s, box-shadow 0.3s;
          background: #f0dde6;
        }
        .grid-item:hover {
          transform: scale(1.04);
          box-shadow: 0 12px 35px rgba(249,161,194,0.4);
        }
        .grid-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s;
        }
        .grid-item:hover img { transform: scale(1.06); }

        /* Badge showing how many extra pics */
        .more-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(255,110,196,0.85);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 50px;
          backdrop-filter: blur(4px);
          letter-spacing: 0.5px;
        }

        /* ── LIGHTBOX ── */
        .lb-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 8, 15, 0.92);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .lb-inner {
          position: relative;
          max-width: 820px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .lb-img-wrap {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lb-img {
          max-height: 78vh;
          max-width: 100%;
          border-radius: 20px;
          object-fit: contain;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6);
          animation: zoomIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes zoomIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* Arrow buttons */
        .lb-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          font-size: 1.3rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(6px);
          transition: background 0.2s, transform 0.2s;
          z-index: 10;
          outline: none;
        }
        .lb-arrow:hover { background: rgba(249,161,194,0.5); transform: translateY(-50%) scale(1.1); }
        .lb-arrow.left  { left: -24px; }
        .lb-arrow.right { right: -24px; }
        @media (max-width: 600px) {
          .lb-arrow.left  { left: 6px; }
          .lb-arrow.right { right: 6px; }
        }

        /* Dots */
        .lb-dots {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .lb-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s, transform 0.2s;
          outline: none;
        }
        .lb-dot.active {
          background: #ff6ec4;
          transform: scale(1.4);
        }

        /* Close button */
        .lb-close {
          position: fixed;
          top: 1.25rem;
          right: 1.5rem;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          font-size: 1.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(6px);
          transition: background 0.2s;
          z-index: 1001;
          outline: none;
          line-height: 1;
        }
        .lb-close:hover { background: rgba(255,110,196,0.4); }

        @media (max-width: 768px) {
          header { padding: 1rem 1.5rem; }
          .grid { padding: 1rem; gap: 0.5rem; }
        }
      `}</style>

      <div className="page">
        <header>
          <Link href="/" className="logo">PavNailedIt</Link>
          <Link href="/" className="back">← Назад</Link>
        </header>

        <div className="hero">
          <h1>Gallery <em>💅</em></h1>
          <p>Click any design to view full set</p>
        </div>

        {/* GRID — one card per folder, shows first image as preview */}
        <div className="grid">
          {FOLDERS.map((folder, fi) => (
            <div
              key={folder.id}
              className="grid-item"
              onClick={() => openLightbox(fi, 0)}
            >
              <img src={folder.images[0]} alt={`Nail design ${folder.id}`} loading="lazy" />
              {folder.images.length > 1 && (
                <span className="more-badge">+{folder.images.length - 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="lb-overlay" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox}>×</button>

          <div className="lb-inner" onClick={e => e.stopPropagation()}>
            <div className="lb-img-wrap">
              {/* Left arrow */}
              {hasMultiple && (
                <button className="lb-arrow left" onClick={prev}>‹</button>
              )}

              <img
                key={currentImg} // re-triggers animation on change
                className="lb-img"
                src={currentImg}
                alt="Nail design"
              />

              {/* Right arrow */}
              {hasMultiple && (
                <button className="lb-arrow right" onClick={next}>›</button>
              )}
            </div>

            {/* Dots */}
            {hasMultiple && (
              <div className="lb-dots">
                {currentFolder.images.map((_, i) => (
                  <button
                    key={i}
                    className={`lb-dot ${i === lightbox.imgIndex ? "active" : ""}`}
                    onClick={() => setLightbox(lb => ({ ...lb, imgIndex: i }))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
