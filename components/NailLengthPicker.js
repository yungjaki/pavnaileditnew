import { useState, useEffect } from "react";

const LENGTHS = [
  {
    key: "short",
    label: "Къси",
    labelEn: "SHORT",
    mm: "0–2",
    magnets: 2,
    nailHeight: 22,
    price: 0,
    priceLabel: "Базова цена",
    color: "#ffd6e8",
    tip: "Сладко и спретнато! 🌸",
  },
  {
    key: "medium",
    label: "Средни",
    labelEn: "MEDIUM",
    mm: "3–4",
    magnets: 4,
    nailHeight: 38,
    price: 2.5,
    priceLabel: "+2.5€",
    color: "#ffb3d4",
    tip: "Перфектният баланс! ✨",
  },
  {
    key: "long",
    label: "Дълги",
    labelEn: "LONG",
    mm: "5–7",
    magnets: 6,
    nailHeight: 56,
    price: 5,
    priceLabel: "+5€",
    color: "#ff85bc",
    tip: "Femme fatale виби 💅",
  },
  {
    key: "xlong",
    label: "X-Дълги",
    labelEn: "X-LONG",
    mm: "8–10",
    magnets: 8,
    nailHeight: 76,
    price: 7.5,
    priceLabel: "+7.5€",
    color: "#ff5aa8",
    tip: "Queen energy само! 👑",
  },
];

function Magnet({ index, active, color }) {
  return (
    <div
      className="magnet"
      style={{
        "--delay": `${index * 0.06}s`,
        "--color": active ? color : "#e8d5df",
        "--scale": active ? 1 : 0.85,
        "--opacity": active ? 1 : 0.35,
      }}
    >
      <style jsx>{`
        .magnet {
          width: 28px;
          height: 10px;
          border-radius: 3px;
          background: var(--color);
          transform: scaleX(var(--scale));
          opacity: var(--opacity);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transition-delay: var(--delay);
          box-shadow: ${active ? `0 2px 8px ${color}66` : "none"};
          position: relative;
        }
        .magnet::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 4px;
          right: 4px;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.4);
        }
      `}</style>
    </div>
  );
}

function Finger({ length, isSelected }) {
  const { nailHeight, color, key } = length;

  return (
    <div className="finger-wrap">
      <style jsx>{`
        .finger-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .nail {
          width: 36px;
          border-radius: 50% 50% 8px 8px / 60% 60% 8px 8px;
          background: ${isSelected
            ? `linear-gradient(160deg, ${color}, ${color}cc)`
            : "linear-gradient(160deg, #ffe0ee, #f8c8dc)"};
          transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          height: ${nailHeight}px;
          box-shadow: ${isSelected
            ? `0 4px 20px ${color}88, inset 0 -4px 8px rgba(0,0,0,0.08), inset 2px 2px 6px rgba(255,255,255,0.6)`
            : "inset 0 -3px 6px rgba(0,0,0,0.06), inset 2px 2px 5px rgba(255,255,255,0.5)"};
          position: relative;
          overflow: hidden;
        }
        .nail::before {
          content: "";
          position: absolute;
          top: 6px;
          left: 6px;
          width: 10px;
          height: ${Math.max(8, nailHeight * 0.3)}px;
          border-radius: 50%;
          background: rgba(255,255,255,${isSelected ? "0.55" : "0.4"});
          transition: all 0.45s;
        }
        .cuticle {
          width: 42px;
          height: 14px;
          background: linear-gradient(180deg, #f5c8d4, #e8b4c0);
          border-radius: 0 0 4px 4px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);
        }
        .finger-body {
          width: 44px;
          height: 55px;
          background: linear-gradient(180deg, #f5d0d8 0%, #f0c4cc 40%, #e8b8c0 100%);
          border-radius: 0 0 10px 10px;
          box-shadow: 2px 4px 12px rgba(0,0,0,0.12), inset -2px 0 6px rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
        }
        .finger-body::after {
          content: "";
          position: absolute;
          top: 0;
          left: 6px;
          width: 8px;
          bottom: 0;
          background: rgba(255,255,255,0.2);
          border-radius: 0 0 4px 4px;
        }
        .knuckle {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          border-radius: 2px;
          background: rgba(0,0,0,0.06);
        }
      `}</style>
      <div className="nail" />
      <div className="cuticle" />
      <div className="finger-body">
        <div className="knuckle" />
      </div>
    </div>
  );
}

export default function NailLengthPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const active = hovered || value;
  const activeLength = LENGTHS.find(l => l.key === active);
  const maxMagnets = 8;

  return (
    <div className={`picker ${animated ? "in" : ""}`}>
      <style jsx>{`
        .picker {
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .picker.in { opacity: 1; transform: translateY(0); }

        .cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }

        .card {
          border-radius: 20px;
          border: 2px solid rgba(249,161,194,0.25);
          background: #fdf8fa;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 6px 12px;
          gap: 8px;
          position: relative;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }
        .card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,110,196,0.4);
          background: #fff5fa;
          box-shadow: 0 8px 24px rgba(255,110,196,0.15);
        }
        .card.selected {
          border-color: #ff6ec4;
          background: linear-gradient(160deg, #fff5fb, #ffe8f4);
          box-shadow: 0 10px 30px rgba(255,110,196,0.25);
          transform: translateY(-5px);
        }
        .card.selected::before {
          content: "✓";
          position: absolute;
          top: 8px;
          right: 10px;
          font-size: 11px;
          font-weight: 800;
          color: #ff6ec4;
        }

        .magnets-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          min-height: 88px;
          justify-content: flex-end;
        }

        .card-label {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #c994b0;
          transition: color 0.2s;
        }
        .card.selected .card-label,
        .card:hover .card-label { color: #e0559e; }

        .card-mm {
          font-size: 0.62rem;
          color: #d4adc0;
          font-weight: 500;
          margin-top: -4px;
        }

        .card-price {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(255,110,196,0.1);
          color: #e0559e;
          transition: all 0.2s;
        }
        .card.selected .card-price {
          background: rgba(255,110,196,0.2);
          color: #c94090;
        }

        /* Preview panel */
        .preview {
          background: linear-gradient(135deg, #fff5fb, #ffe8f4);
          border-radius: 20px;
          border: 1.5px solid rgba(255,110,196,0.2);
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          min-height: 90px;
          transition: all 0.3s;
        }
        .preview-finger {
          flex-shrink: 0;
        }
        .preview-info {
          flex: 1;
        }
        .preview-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #c94090;
          line-height: 1.1;
        }
        .preview-tip {
          font-size: 0.85rem;
          color: #d4a0bc;
          margin-top: 4px;
          font-style: italic;
        }
        .preview-price-big {
          font-size: 1.1rem;
          font-weight: 800;
          color: #e0559e;
          margin-top: 6px;
        }
        .preview-magnets {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .preview-magnet-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffb3d4;
          transition: all 0.25s;
        }
        .preview-magnet-dot.active {
          background: #ff6ec4;
          box-shadow: 0 0 6px #ff6ec488;
        }
        .preview-mm {
          font-size: 0.78rem;
          font-weight: 600;
          color: #e0a0c0;
          background: rgba(255,110,196,0.12);
          padding: 2px 10px;
          border-radius: 20px;
          display: inline-block;
          margin-top: 6px;
        }
        .placeholder {
          color: #d4a0bc;
          font-size: 0.9rem;
          font-style: italic;
          flex: 1;
          text-align: center;
        }

        @media (max-width: 480px) {
          .cards { gap: 7px; }
          .card { padding: 10px 4px 10px; }
          .card-label { font-size: 0.6rem; letter-spacing: 1px; }
          .card-price { font-size: 0.65rem; padding: 2px 7px; }
        }
      `}</style>

      {/* 4 cards */}
      <div className="cards">
        {LENGTHS.map((len) => (
          <button
            key={len.key}
            type="button"
            className={`card ${value === len.key ? "selected" : ""}`}
            onClick={() => onChange(value === len.key ? null : len.key)}
            onMouseEnter={() => setHovered(len.key)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Magnet stack */}
            <div className="magnets-col">
              {Array.from({ length: maxMagnets }).map((_, i) => (
                <Magnet
                  key={i}
                  index={i}
                  active={i < len.magnets}
                  color={len.color}
                />
              ))}
            </div>

            <span className="card-label">{len.labelEn}</span>
            <span className="card-mm">{len.mm} mm</span>
            <span className="card-price">{len.priceLabel}</span>
          </button>
        ))}
      </div>

      {/* Preview panel */}
      <div className="preview">
        {activeLength ? (
          <>
            <div className="preview-finger">
              <Finger length={activeLength} isSelected={true} />
            </div>
            <div className="preview-info">
              <div className="preview-title">{activeLength.label}</div>
              <div className="preview-mm">{activeLength.mm} mm</div>
              <div className="preview-magnets">
                {Array.from({ length: maxMagnets }).map((_, i) => (
                  <div
                    key={i}
                    className={`preview-magnet-dot ${i < activeLength.magnets ? "active" : ""}`}
                  />
                ))}
                <span style={{fontSize:'0.72rem', color:'#d4a0bc', marginLeft: 2}}>
                  {activeLength.magnets} магнита
                </span>
              </div>
              <div className="preview-tip">{activeLength.tip}</div>
              <div className="preview-price-big">
                {activeLength.price === 0 ? "Включено в цената ✓" : `${activeLength.priceLabel} към общата цена`}
              </div>
            </div>
          </>
        ) : (
          <p className="placeholder">👆 Избери дължина за да видиш преглед</p>
        )}
      </div>
    </div>
  );
}
