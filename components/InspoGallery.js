import { useState } from "react";

// Curated inspo designs — Pinterest URLs as src, auto-selects services
// Pavlina can update INSPOS array with her own photos later
const INSPOS = [
  {
    id: 1,
    title: "Розово омбре",
    category: "ombre",
    src: "https://i.pinimg.com/564x/8b/2e/1e/8b2e1e3b7e4a5f9c2d1a0b6e8f3c4d7a.jpg",
    placeholder: "linear-gradient(135deg, #ffb3d4, #ff6ec4, #c94090)",
    autoServices: ["Гел - дълги нокти"],
    autoAddons: ["Омбре"],
    autoLength: "long",
    tags: ["омбре", "розово", "романтично"],
  },
  {
    id: 2,
    title: "3D Цветя",
    category: "3d",
    src: null,
    placeholder: "linear-gradient(135deg, #ffd6e8, #ffb3d4, #f8b7d1)",
    autoServices: ["Гел - дълги нокти"],
    autoAddons: ["3D цветя", "Blooming gel цвете"],
    autoLength: "long",
    tags: ["3d", "цветя", "пролет"],
  },
  {
    id: 3,
    title: "Бяло омбре",
    category: "ombre",
    src: null,
    placeholder: "linear-gradient(135deg, #fff, #f0e6f0, #e8d0e8)",
    autoServices: ["Гел - дълги нокти"],
    autoAddons: ["Бяло омбре"],
    autoLength: "long",
    tags: ["омбре", "бяло", "минимал"],
  },
  {
    id: 4,
    title: "Аура нокти",
    category: "aura",
    src: null,
    placeholder: "linear-gradient(135deg, #c8f0ff, #e0c8ff, #ffc8e8)",
    autoServices: ["Гел - средни нокти"],
    autoAddons: ["Аура"],
    autoLength: "medium",
    tags: ["аура", "пастел", "мечтателно"],
  },
  {
    id: 5,
    title: "Минималистично Френски",
    category: "minimal",
    src: null,
    placeholder: "linear-gradient(135deg, #fff5f8, #ffe0ec, #ffd0e4)",
    autoServices: ["Гел - къси нокти"],
    autoAddons: ["Френски"],
    autoLength: "short",
    tags: ["минимал", "френски", "класик"],
  },
  {
    id: 6,
    title: "Панделки и блясък",
    category: "cute",
    src: null,
    placeholder: "linear-gradient(135deg, #ffb3d4, #ffd6e8, #ff85bc)",
    autoServices: ["Гел - средни нокти"],
    autoAddons: ["Панделка", "Сребърно/златно"],
    autoLength: "medium",
    tags: ["панделки", "сладко", "girly"],
  },
  {
    id: 7,
    title: "Животинска щампа",
    category: "art",
    src: null,
    placeholder: "linear-gradient(135deg, #2d2d2d, #5c3d2e, #8b5e3c)",
    autoServices: ["Гел - дълги нокти"],
    autoAddons: ["Животински дизайн"],
    autoLength: "long",
    tags: ["животински", "bold", "уникално"],
  },
  {
    id: 8,
    title: "Blooming Gel",
    category: "art",
    src: null,
    placeholder: "linear-gradient(135deg, #e8f4f8, #d0e8f0, #b8dcec)",
    autoServices: ["Гел - дълги нокти"],
    autoAddons: ["Blooming gel", "Blooming gel цвете"],
    autoLength: "long",
    tags: ["blooming", "арт", "нежно"],
  },
  {
    id: 9,
    title: "3D Линии",
    category: "3d",
    src: null,
    placeholder: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    autoServices: ["Гел - дълги нокти"],
    autoAddons: ["3D линии"],
    autoLength: "long",
    tags: ["3d", "линии", "модерно"],
  },
];

const CATEGORIES = [
  { id: "all",    label: "Всички ✨" },
  { id: "ombre",  label: "Омбре 🌅" },
  { id: "3d",     label: "3D 🌸" },
  { id: "aura",   label: "Аура 🌈" },
  { id: "minimal",label: "Минимал 🤍" },
  { id: "cute",   label: "Cute 🎀" },
  { id: "art",    label: "Арт 🎨" },
];

export default function InspoGallery({ onSelect, selectedId }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const filtered = activeCategory === "all"
    ? INSPOS
    : INSPOS.filter(i => i.category === activeCategory);

  return (
    <div className="gallery-wrap">
      <style>{`
        .gallery-wrap { margin-bottom: 0.5rem; }

        /* ── category pills ── */
        .cat-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 10px;
          margin-bottom: 14px;
          scrollbar-width: none;
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-pill {
          flex-shrink: 0;
          padding: 6px 16px;
          border-radius: 50px;
          border: 1.5px solid rgba(249,161,194,0.35);
          background: #fdf8fa;
          font-size: 0.78rem;
          font-weight: 600;
          color: #c994b0;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          outline: none;
        }
        .cat-pill:hover { border-color: #ff6ec4; color: #e0559e; background: #fff0f8; }
        .cat-pill.active {
          background: linear-gradient(135deg, #f8b7d1, #ff6ec4);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(255,110,196,0.3);
        }

        /* ── grid ── */
        .inspo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media (max-width: 480px) {
          .inspo-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }

        /* ── card ── */
        .inspo-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 2.5px solid transparent;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          aspect-ratio: 3/4;
          outline: none;
        }
        .inspo-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 30px rgba(255,110,196,0.2); }
        .inspo-card.selected {
          border-color: #ff6ec4;
          box-shadow: 0 0 0 3px rgba(255,110,196,0.25), 0 12px 30px rgba(255,110,196,0.3);
          transform: translateY(-5px) scale(1.03);
        }
        .inspo-bg {
          width: 100%;
          height: 100%;
          background: var(--grad);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .inspo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
        }
        /* shimmer placeholder */
        .inspo-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.15) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* nail art icon inside placeholder */
        .inspo-icon {
          font-size: 2.2rem;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
          position: relative;
          z-index: 1;
        }

        /* bottom overlay */
        .inspo-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 100%);
          padding: 20px 10px 8px;
          color: #fff;
        }
        .inspo-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: block;
        }
        .inspo-services-count {
          font-size: 0.62rem;
          opacity: 0.8;
          margin-top: 1px;
        }

        /* selected checkmark */
        .inspo-check {
          position: absolute;
          top: 8px; right: 8px;
          width: 24px; height: 24px;
          background: #ff6ec4;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #fff;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(255,110,196,0.5);
          animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* ── selected preview banner ── */
        .inspo-selected-banner {
          background: linear-gradient(135deg, #fff0f8, #ffe4f2);
          border: 1.5px solid rgba(255,110,196,0.3);
          border-radius: 16px;
          padding: 14px 16px;
          margin-top: 12px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .banner-preview {
          width: 48px;
          height: 60px;
          border-radius: 10px;
          flex-shrink: 0;
          background: var(--grad);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }
        .banner-info { flex: 1; }
        .banner-title {
          font-weight: 700;
          color: #c94090;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }
        .banner-auto {
          font-size: 0.75rem;
          color: #d4a0bc;
          line-height: 1.5;
        }
        .banner-auto strong { color: #e0559e; }
        .banner-clear {
          background: none;
          border: none;
          color: #d4a0bc;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 2px 4px;
          line-height: 1;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .banner-clear:hover { color: #e53e3e; }

        .inspo-skip {
          text-align: center;
          margin-top: 10px;
          font-size: 0.78rem;
          color: #d4a0bc;
        }
        .inspo-skip button {
          background: none;
          border: none;
          color: #e0a0c0;
          font-size: 0.78rem;
          cursor: pointer;
          text-decoration: underline;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      {/* Category filter */}
      <div className="cat-scroll">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            type="button"
            className={`cat-pill ${activeCategory === c.id ? "active" : ""}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="inspo-grid">
        {filtered.map((inspo, idx) => (
          <button
            key={inspo.id}
            type="button"
            className={`inspo-card ${selectedId === inspo.id ? "selected" : ""}`}
            onClick={() => onSelect(selectedId === inspo.id ? null : inspo)}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="inspo-bg" style={{ "--grad": inspo.placeholder }}>
              {inspo.src ? (
                <img src={inspo.src} alt={inspo.title} className="inspo-img" />
              ) : (
                <>
                  <div className="inspo-shimmer" />
                  <span className="inspo-icon">
                    {inspo.category === "ombre"  ? "🌅" :
                     inspo.category === "3d"     ? "🌸" :
                     inspo.category === "aura"   ? "🌈" :
                     inspo.category === "minimal"? "🤍" :
                     inspo.category === "cute"   ? "🎀" : "🎨"}
                  </span>
                </>
              )}
            </div>
            <div className="inspo-overlay">
              <span className="inspo-title">{inspo.title}</span>
              <span className="inspo-services-count">
                {inspo.autoAddons.length} услуги включени
              </span>
            </div>
            {selectedId === inspo.id && <div className="inspo-check">✓</div>}
          </button>
        ))}
      </div>

      {/* Selected inspo banner */}
      {selectedId && (() => {
        const sel = INSPOS.find(i => i.id === selectedId);
        if (!sel) return null;
        return (
          <div className="inspo-selected-banner">
            <div className="banner-preview" style={{ "--grad": sel.placeholder }}>
              {sel.category === "ombre" ? "🌅" :
               sel.category === "3d"   ? "🌸" :
               sel.category === "aura" ? "🌈" :
               sel.category === "minimal" ? "🤍" :
               sel.category === "cute" ? "🎀" : "🎨"}
            </div>
            <div className="banner-info">
              <div className="banner-title">✨ {sel.title}</div>
              <div className="banner-auto">
                <strong>Авто-избрано:</strong> {[...sel.autoServices, ...sel.autoAddons].join(", ")}
              </div>
              <div className="banner-auto" style={{marginTop:"2px"}}>
                Можеш да добавиш още декорации по-долу 👇
              </div>
            </div>
            <button type="button" className="banner-clear" onClick={() => onSelect(null)} title="Изчисти избора">✕</button>
          </div>
        );
      })()}

      <p className="inspo-skip">
        Нямаш любим дизайн?{" "}
        <button type="button" onClick={() => onSelect(null)}>
          Избери услуги ръчно ↓
        </button>
      </p>
    </div>
  );
}

export { INSPOS };
