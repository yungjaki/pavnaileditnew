import { useState } from "react";

export const NAIL_LENGTHS = [
  { key: "short",  label: "Къси",    range: "0–2",  magnets: 2, nailH: 22, price: "Базова" },
  { key: "medium", label: "Средни",  range: "3–4",  magnets: 4, nailH: 38, price: "+2.5€"  },
  { key: "long",   label: "Дълги",   range: "5–7",  magnets: 6, nailH: 58, price: "+5€"    },
  { key: "xlong",  label: "X-Дълги", range: "8–10", magnets: 9, nailH: 80, price: "+7.5€"  },
];

export default function NailLengthPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  const active = hovered || value;
  const activeData = NAIL_LENGTHS.find(n => n.key === active) || NAIL_LENGTHS[0];

  return (
    <div className="nlp-wrap">
      <style jsx>{`
        .nlp-wrap { margin-bottom: 1rem; }
        .nlp-scene {
          display: flex; align-items: flex-end; justify-content: center; gap: 40px;
          background: linear-gradient(160deg, #fdfaf8, #faf3ee);
          border-radius: 20px; padding: 24px 16px 20px; margin-bottom: 14px;
          border: 1.5px solid rgba(220,190,170,0.3); min-height: 150px;
          position: relative; overflow: hidden;
        }
        .nlp-nail-only { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
        .nlp-nail-shape {
          width: 42px; border-radius: 50% 50% 6px 6px; position: relative;
          background: linear-gradient(160deg, #f5e6d8, #e8d0bc, #dfc4aa);
          box-shadow: inset -2px -3px 6px rgba(0,0,0,0.06), inset 1px 1px 4px rgba(255,255,255,0.5), 0 4px 16px rgba(180,140,110,0.2);
          transition: height 0.45s var(--ease-out);
        }
        .nlp-nail-shape::before {
          content: ''; position: absolute; top: 8px; left: 7px; width: 10px; height: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.45), transparent);
          border-radius: 50%; transform: rotate(-12deg);
        }
        .nlp-nail-base {
          width: 44px; height: 6px; margin-top: -1px;
          background: linear-gradient(180deg, #e0c8b0, #d4b89a);
          border-radius: 0 0 6px 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        .nlp-magnets { display: flex; flex-direction: column-reverse; align-items: center; gap: 3px; padding-bottom: 4px; }
        .nlp-magnet {
          width: 34px; height: 13px; border-radius: 4px;
          background: linear-gradient(135deg, #d8d0c8, #b0a898);
          box-shadow: 0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.35);
          animation: magnetDrop 0.3s var(--ease-out) both;
        }
        @keyframes magnetDrop {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nlp-info { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; padding-bottom: 4px; min-width: 90px; }
        .nlp-info-mm { font-size: 0.72rem; color: #7d6656; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .nlp-info-range { font-size: 2rem; font-family: 'Cormorant Garamond', serif; font-weight: 600; color: #6b4f3e; line-height: 1; }
        .nlp-info-label { font-size: 0.95rem; font-weight: 700; color: #5a4234; margin: 3px 0 2px; }
        .nlp-info-price { font-size: 0.85rem; font-weight: 700; color: #8a5a30; }
        .nlp-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .nlp-btn {
          min-height: 56px; padding: 0.6rem 0.3rem; border-radius: 14px;
          border: 2px solid rgba(200,160,130,0.45); background: #fdfaf8; cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.2s var(--ease-out);
          font-family: 'DM Sans', sans-serif; text-align: center;
        }
        .nlp-btn:hover { border-color: #b88a62; background: #fdf4ee; transform: translateY(-2px); }
        .nlp-btn.selected { border-color: #9c6a45; background: linear-gradient(135deg, #fdf0e8, #fae0cc); box-shadow: 0 4px 14px rgba(200,140,100,0.2); }
        .nlp-btn-label { font-size: 0.8rem; font-weight: 700; color: #5a4234; display: block; }
        .nlp-btn-range { font-size: 0.72rem; color: #7d6656; display: block; margin: 1px 0; }
        .nlp-btn-price { font-size: 0.74rem; font-weight: 700; color: #8a5a30; display: block; }
        .nlp-hint { text-align: center; font-size: 0.82rem; color: #7d6656; margin-top: 8px; }
      `}</style>

      <div className="nlp-scene" aria-hidden="true">
        <div className="nlp-nail-only">
          <div className="nlp-nail-shape" style={{ height: activeData.nailH }} />
          <div className="nlp-nail-base" />
        </div>
        <div className="nlp-magnets">
          {Array.from({ length: activeData.magnets }).map((_, i) => (
            <div key={i} className="nlp-magnet" style={{ animationDelay: `${i * 0.04}s` }} />
          ))}
        </div>
        <div className="nlp-info">
          <div className="nlp-info-mm">мм</div>
          <div className="nlp-info-range">{activeData.range}</div>
          <div className="nlp-info-label">{activeData.label}</div>
          <div className="nlp-info-price">{activeData.price}</div>
        </div>
      </div>

      <div className="nlp-buttons" role="group" aria-label="Дължина на ноктите">
        {NAIL_LENGTHS.map(n => (
          <button
            key={n.key}
            type="button"
            aria-pressed={value === n.key}
            className={`nlp-btn ${value === n.key ? "selected" : ""}`}
            onClick={() => onChange(value === n.key ? null : n.key)}
            onMouseEnter={() => setHovered(n.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(n.key)}
            onBlur={() => setHovered(null)}
          >
            <span className="nlp-btn-label">{n.label}</span>
            <span className="nlp-btn-range">{n.range} mm</span>
            <span className="nlp-btn-price">{n.price}</span>
          </button>
        ))}
      </div>
      {!value && <p className="nlp-hint">Избери дължина, за да видиш цената</p>}
    </div>
  );
}
