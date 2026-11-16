import { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "all",     label: "Всички" },
  { id: "ombre",   label: "Омбре" },
  { id: "3d",      label: "3D" },
  { id: "aura",    label: "Аура" },
  { id: "minimal", label: "Минимал" },
  { id: "cute",    label: "Cute" },
  { id: "art",     label: "Арт" },
];

/**
 * Shows the owner's uploaded inspiration photos. Entries without a photo are
 * skipped, and the whole section hides itself when there is nothing to show,
 * so clients never see empty placeholder cards.
 */
export default function InspoGallery({ onSelect, selectedId }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [inspos, setInspos] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/inspos")
      .then(r => r.json())
      .then(data => setInspos((data.inspos || []).filter(i => i.src)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || inspos.length === 0) return null;

  const usedCategories = CATEGORIES.filter(c => c.id === "all" || inspos.some(i => i.category === c.id));
  const filtered = activeCategory === "all" ? inspos : inspos.filter(i => i.category === activeCategory);
  const isSelected = (i) => String(selectedId) === String(i.id);
  const selectedInspo = inspos.find(isSelected);

  return (
    <section className="gallery-wrap" aria-labelledby="inspo-heading">
      <style jsx>{`
        .gallery-wrap { margin: 1.5rem 0 0.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(249,161,194,0.25); }
        h2 { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); margin: 0 0 0.4rem; }
        .sub { font-size: 0.88rem; color: var(--text-mid); margin: 0 0 0.75rem; }
        .cat-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 12px; scrollbar-width: none; }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-pill { flex-shrink: 0; min-height: 40px; padding: 6px 16px; border-radius: 50px; border: 1.5px solid rgba(176,128,151,0.4); background: #fdf8fa; font-size: 0.85rem; font-weight: 600; color: var(--text-mid); cursor: pointer; transition: border-color 0.2s, background 0.2s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .cat-pill:hover { border-color: var(--pink-deep); background: #fff0f8; }
        .cat-pill.active { background: var(--accent); color: #fff; border-color: transparent; }
        .inspo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (max-width: 480px) { .inspo-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }
        .inspo-card { position: relative; border-radius: 16px; overflow: hidden; cursor: pointer; border: 2.5px solid transparent; transition: transform 0.25s var(--ease-out), box-shadow 0.25s, border-color 0.2s; aspect-ratio: 3/4; background: #fde8f0; padding: 0; }
        .inspo-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(194,24,91,0.18); }
        .inspo-card.selected { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(194,24,91,0.2); }
        .inspo-img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
        .inspo-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 100%); padding: 24px 10px 8px; color: #fff; text-align: left; }
        .inspo-title { font-size: 0.8rem; font-weight: 700; display: block; }
        .inspo-check { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #fff; font-weight: 800; }
        .inspo-banner { background: linear-gradient(135deg,#fff0f8,#ffe4f2); border: 1.5px solid rgba(194,24,91,0.25); border-radius: 16px; padding: 14px 16px; margin-top: 12px; display: flex; align-items: flex-start; gap: 12px; }
        .banner-thumb { width: 48px; height: 60px; border-radius: 10px; flex-shrink: 0; overflow: hidden; }
        .banner-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .banner-info { flex: 1; font-size: 0.85rem; color: var(--text-mid); line-height: 1.5; }
        .banner-ttl { font-weight: 700; color: var(--accent); font-size: 0.95rem; margin-bottom: 4px; }
        .banner-x { background: none; border: none; color: var(--text-mid); font-size: 1.2rem; cursor: pointer; width: 44px; height: 44px; flex-shrink: 0; border-radius: 10px; }
        .banner-x:hover { color: #c53030; background: #fff; }
        .inspo-empty { text-align: center; padding: 1.5rem; color: var(--text-mid); font-size: 0.9rem; }
      `}</style>

      <h2 id="inspo-heading">Избери дизайн от инспирации</h2>
      <p className="sub">Избери любим дизайн — услугите и дължината се попълват автоматично. Или избери всичко ръчно по-долу.</p>

      {usedCategories.length > 2 && (
        <div className="cat-scroll" role="group" aria-label="Категория">
          {usedCategories.map(c => (
            <button key={c.id} type="button" aria-pressed={activeCategory === c.id}
              className={`cat-pill ${activeCategory === c.id ? "active" : ""}`}
              onClick={() => setActiveCategory(c.id)}
            >{c.label}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="inspo-empty">Няма инспирации в тази категория още.</p>
      ) : (
        <div className="inspo-grid">
          {filtered.map(inspo => (
            <button
              key={inspo.id}
              type="button"
              aria-pressed={isSelected(inspo)}
              className={`inspo-card ${isSelected(inspo) ? "selected" : ""}`}
              onClick={() => onSelect(isSelected(inspo) ? null : inspo)}
            >
              <img src={inspo.src} alt="" className="inspo-img" loading="lazy" decoding="async" />
              <span className="inspo-overlay"><span className="inspo-title">{inspo.title}</span></span>
              {isSelected(inspo) && <span className="inspo-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}

      {selectedInspo && (
        <div className="inspo-banner" role="status">
          <div className="banner-thumb"><img src={selectedInspo.src} alt="" /></div>
          <div className="banner-info">
            <div className="banner-ttl">{selectedInspo.title}</div>
            <div><strong>Избрано автоматично:</strong> {[...(selectedInspo.autoServices || []), ...(selectedInspo.autoAddons || [])].join(", ") || "—"}</div>
            <div style={{ marginTop: "2px" }}>Можеш да добавиш още декорации по-долу.</div>
          </div>
          <button type="button" className="banner-x" aria-label="Махни избрания дизайн" onClick={() => onSelect(null)}>✕</button>
        </div>
      )}
    </section>
  );
}
