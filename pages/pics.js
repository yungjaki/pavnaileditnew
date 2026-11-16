import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

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
  const lastTrigger = useRef(null);
  const closeRef = useRef(null);
  const closeLightbox = () => {
    setLightbox(null);
    // Return focus to the photo that opened the lightbox.
    requestAnimationFrame(() => lastTrigger.current?.focus());
  };

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
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, next, prev]);

  const currentFolder = lightbox ? FOLDERS[lightbox.folderIndex] : null;
  const currentImg = currentFolder ? currentFolder.images[lightbox.imgIndex] : null;
  const hasMultiple = currentFolder && currentFolder.images.length > 1;

  return (
    <>
      <Head>
        <title>Галерия – PavNailedIt</title>
        <meta name="description" content="Галерия с маникюри и nail art от PavNailedIt, Пловдив." />
        <meta property="og:title" content="Галерия – PavNailedIt" />
        <meta property="og:image" content="https://pavnailed.it/nails/1/nail1.jpg" />
      </Head>

      <style jsx>{`

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
        :global(.logo) {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--accent);
        }
        :global(.back) {
          display: inline-flex; align-items: center; min-height: 44px; padding: 0 0.5rem;
          color: var(--text-mid);
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        :global(.back):hover { color: var(--accent); }

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
          color: var(--text-mid);
          margin-top: 0.6rem;
          font-size: 1rem;
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
          transition: transform 0.3s var(--ease-out), box-shadow 0.3s;
          background: #f0dde6;
          border: 0;
          padding: 0;
          width: 100%;
          display: block;
        }
        .grid-item:hover {
          transform: scale(1.04);
          box-shadow: 0 12px 35px rgba(249,161,194,0.4);
        }
        .grid-item :global(img) { transition: transform 0.4s var(--ease-out); }
        .grid-item:hover :global(img) { transform: scale(1.06); }

        /* Badge showing how many extra pics */
        .more-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(194,24,91,0.9);
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

        .lb-img-wrap :global(.lb-img) {
          max-height: 78vh;
          max-width: 100%;
          border-radius: 20px;
          object-fit: contain;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6);
          animation: zoomIn 0.25s var(--ease-out);
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
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .lb-dot::before {
          content: ''; width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.4); transition: background 0.2s, transform 0.2s;
        }
        .lb-dot.active::before {
          background: #f8b7d1;
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
          width: 48px;
          height: 48px;
          border-radius: 50%;
          font-size: 1.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(6px);
          transition: background 0.2s;
          z-index: 1001;
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

        <main>
          <div className="hero">
            <h1>Галерия</h1>
            <p>Натисни върху дизайн, за да видиш всички снимки</p>
          </div>

          {/* GRID — one card per folder, shows first image as preview */}
          <ul className="grid" role="list">
            {FOLDERS.map((folder, fi) => (
              <li key={folder.id} style={{ listStyle: "none" }}>
                <button
                  type="button"
                  className="grid-item"
                  onClick={(e) => { lastTrigger.current = e.currentTarget; openLightbox(fi, 0); }}
                  aria-label={`Дизайн ${folder.id}${folder.images.length > 1 ? `, ${folder.images.length} снимки` : ""}`}
                >
                  <Image
                    src={folder.images[0]}
                    alt=""
                    fill
                    sizes="(max-width: 500px) 50vw, (max-width: 800px) 33vw, (max-width: 1100px) 25vw, 220px"
                    style={{ objectFit: "cover" }}
                  />
                  {folder.images.length > 1 && (
                    <span className="more-badge" aria-hidden="true">+{folder.images.length - 1}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </main>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          className="lb-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Дизайн ${currentFolder.id}, снимка ${lightbox.imgIndex + 1} от ${currentFolder.images.length}`}
        >
          <button className="lb-close" onClick={closeLightbox} aria-label="Затвори" ref={closeRef}>×</button>

          <div className="lb-inner" onClick={e => e.stopPropagation()}>
            <div className="lb-img-wrap">
              {/* Left arrow */}
              {hasMultiple && (
                <button className="lb-arrow left" onClick={prev} aria-label="Предишна снимка">‹</button>
              )}

              <Image
                key={currentImg} // re-triggers animation on change
                className="lb-img"
                src={currentImg}
                alt={`Дизайн ${currentFolder.id}, снимка ${lightbox.imgIndex + 1}`}
                width={1080}
                height={1350}
                sizes="(max-width: 860px) 100vw, 820px"
                style={{ width: "auto", height: "auto" }}
                priority
              />

              {/* Right arrow */}
              {hasMultiple && (
                <button className="lb-arrow right" onClick={next} aria-label="Следваща снимка">›</button>
              )}
            </div>

            {/* Dots */}
            {hasMultiple && (
              <div className="lb-dots">
                {currentFolder.images.map((_, i) => (
                  <button
                    key={i}
                    className={`lb-dot ${i === lightbox.imgIndex ? "active" : ""}`}
                    aria-label={`Снимка ${i + 1}`}
                    aria-current={i === lightbox.imgIndex ? "true" : undefined}
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
