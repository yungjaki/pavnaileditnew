import { useState, useEffect } from "react";

// Fallback inspos shown before Firestore data loads
const FALLBACK_INSPOS = [
  { id: "f1", title: "Розово омбре",       category: "ombre",   src: null, placeholder: "linear-gradient(135deg,#ffb3d4,#ff6ec4,#c94090)", autoServices: ["Гел - дълги нокти"], autoAddons: ["Омбре"],                          autoLength: "long"   },
  { id: "f2", title: "3D Цветя",           category: "3d",      src: null, placeholder: "linear-gradient(135deg,#ffd6e8,#ffb3d4,#f8b7d1)", autoServices: ["Гел - дълги нокти"], autoAddons: ["3D цветя","Blooming gel цвете"],   autoLength: "long"   },
  { id: "f3", title: "Бяло омбре",         category: "ombre",   src: null, placeholder: "linear-gradient(135deg,#fff,#f0e6f0,#e8d0e8)",    autoServices: ["Гел - дълги нокти"], autoAddons: ["Бяло омбре"],                     autoLength: "long"   },
  { id: "f4", title: "Аура нокти",         category: "aura",    src: null, placeholder: "linear-gradient(135deg,#c8f0ff,#e0c8ff,#ffc8e8)", autoServices: ["Гел - дълги нокти"], autoAddons: ["Аура"],                           autoLength: "medium" },
  { id: "f5", title: "Минимал Френски",    category: "minimal", src: null, placeholder: "linear-gradient(135deg,#fff5f8,#ffe0ec,#ffd0e4)", autoServices: ["Гел - къси нокти"],  autoAddons: ["Френски"],                        autoLength: "short"  },
  { id: "f6", title: "Панделки и блясък",  category: "cute",    src: null, placeholder: "linear-gradient(135deg,#ffb3d4,#ffd6e8,#ff85bc)", autoServices: ["Гел - дълги нокти"], autoAddons: ["Панделка","Сребърно/златно"],      autoLength: "medium" },
];

const CATEGORIES = [
  { id: "all",     label: "Всички ✨" },
  { id: "ombre",   label: "Омбре 🌅" },
  { id: "3d",      label: "3D 🌸"    },
  { id: "aura",    label: "Аура 🌈"  },
  { id: "minimal", label: "Минимал 🤍" },
  { id: "cute",    label: "Cute 🎀"  },
  { id: "art",     label: "Арт 🎨"   },
];

const ICON_MAP = { ombre:"🌅", "3d":"🌸", aura:"🌈", minimal:"🤍", cute:"🎀", art:"🎨" };

export default function InspoGallery({ onSelect, selectedId }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [inspos, setInspos] = useState(FALLBACK_INSPOS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/inspos")
      .then(r => r.json())
      .then(data => {
        if (data.inspos?.length > 0) setInspos(data.inspos);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const filtered = activeCategory === "all"
    ? inspos
    : inspos.filter(i => i.category === activeCategory);

  const selectedInspo = inspos.find(i => i.id === selectedId || String(i.id) === String(selectedId));

  return (
    <div className="gallery-wrap">
      <style>{`
        .gallery-wrap { margin-bottom: 0.5rem; }
        .cat-scroll { display:flex; gap:8px; overflow-x:auto; padding-bottom:10px; margin-bottom:14px; scrollbar-width:none; }
        .cat-scroll::-webkit-scrollbar { display:none; }
        .cat-pill { flex-shrink:0; padding:6px 16px; border-radius:50px; border:1.5px solid rgba(249,161,194,0.35); background:#fdf8fa; font-size:0.78rem; font-weight:600; color:#c994b0; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; white-space:nowrap; outline:none; }
        .cat-pill:hover { border-color:#ff6ec4; color:#e0559e; background:#fff0f8; }
        .cat-pill.active { background:linear-gradient(135deg,#f8b7d1,#ff6ec4); color:#fff; border-color:transparent; box-shadow:0 4px 12px rgba(255,110,196,0.3); }

        .inspo-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        @media(max-width:480px) { .inspo-grid { grid-template-columns:repeat(2,1fr); gap:8px; } }

        .inspo-card { position:relative; border-radius:16px; overflow:hidden; cursor:pointer; border:2.5px solid transparent; transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); aspect-ratio:3/4; outline:none; background:none; padding:0; }
        .inspo-card:hover { transform:translateY(-4px) scale(1.02); box-shadow:0 12px 30px rgba(255,110,196,0.2); }
        .inspo-card.selected { border-color:#ff6ec4; box-shadow:0 0 0 3px rgba(255,110,196,0.25),0 12px 30px rgba(255,110,196,0.3); transform:translateY(-5px) scale(1.03); }

        .inspo-bg { width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative; }
        .inspo-img { width:100%; height:100%; object-fit:cover; position:absolute; inset:0; }
        .inspo-shimmer { position:absolute; inset:0; background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%); background-size:200% 100%; animation:shimmer 2s infinite; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .inspo-icon { font-size:2.2rem; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.15)); position:relative; z-index:1; }

        .inspo-overlay { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(0deg,rgba(0,0,0,0.55) 0%,transparent 100%); padding:20px 10px 8px; color:#fff; text-align:left; }
        .inspo-title { font-size:0.72rem; font-weight:700; letter-spacing:0.5px; display:block; }
        .inspo-count { font-size:0.62rem; opacity:0.8; margin-top:1px; display:block; }

        .inspo-check { position:absolute; top:8px; right:8px; width:24px; height:24px; background:#ff6ec4; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; color:#fff; font-weight:800; box-shadow:0 2px 8px rgba(255,110,196,0.5); animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

        .inspo-banner { background:linear-gradient(135deg,#fff0f8,#ffe4f2); border:1.5px solid rgba(255,110,196,0.3); border-radius:16px; padding:14px 16px; margin-top:12px; display:flex; align-items:flex-start; gap:12px; animation:slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .banner-thumb { width:48px; height:60px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.4rem; overflow:hidden; }
        .banner-thumb img { width:100%; height:100%; object-fit:cover; }
        .banner-info { flex:1; }
        .banner-ttl { font-weight:700; color:#c94090; font-size:0.9rem; margin-bottom:4px; }
        .banner-auto { font-size:0.75rem; color:#d4a0bc; line-height:1.5; }
        .banner-auto strong { color:#e0559e; }
        .banner-x { background:none; border:none; color:#d4a0bc; font-size:1.1rem; cursor:pointer; padding:2px 4px; flex-shrink:0; transition:color 0.2s; }
        .banner-x:hover { color:#e53e3e; }

        .inspo-skip { text-align:center; margin-top:10px; font-size:0.78rem; color:#d4a0bc; }
        .inspo-skip button { background:none; border:none; color:#e0a0c0; font-size:0.78rem; cursor:pointer; text-decoration:underline; font-family:'DM Sans',sans-serif; }

        .inspo-empty { text-align:center; padding:2rem; color:#d4a0bc; font-size:0.9rem; font-style:italic; }
      `}</style>

      {/* Category pills */}
      <div className="cat-scroll">
        {CATEGORIES.map(c => (
          <button key={c.id} type="button"
            className={`cat-pill ${activeCategory === c.id ? "active" : ""}`}
            onClick={() => setActiveCategory(c.id)}
          >{c.label}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="inspo-empty">
          {loaded ? "Няма инспирации в тази категория още 🌸" : "Зарежда се..."}
        </div>
      ) : (
        <div className="inspo-grid">
          {filtered.map((inspo, idx) => (
            <button
              key={inspo.id}
              type="button"
              className={`inspo-card ${String(selectedId) === String(inspo.id) ? "selected" : ""}`}
              onClick={() => onSelect(String(selectedId) === String(inspo.id) ? null : inspo)}
            >
              <div className="inspo-bg" style={{background: inspo.placeholder || "linear-gradient(135deg,#f8b7d1,#ff6ec4)"}}>
                {inspo.src
                  ? <img src={inspo.src} alt={inspo.title} className="inspo-img" />
                  : <><div className="inspo-shimmer" /><span className="inspo-icon">{ICON_MAP[inspo.category] || "💅"}</span></>
                }
              </div>
              <div className="inspo-overlay">
                <span className="inspo-title">{inspo.title}</span>
                <span className="inspo-count">{(inspo.autoAddons?.length||0)} услуги включени</span>
              </div>
              {String(selectedId) === String(inspo.id) && <div className="inspo-check">✓</div>}
            </button>
          ))}
        </div>
      )}

      {/* Selected banner */}
      {selectedInspo && (
        <div className="inspo-banner">
          <div className="banner-thumb" style={{background: selectedInspo.placeholder || "linear-gradient(135deg,#f8b7d1,#ff6ec4)"}}>
            {selectedInspo.src
              ? <img src={selectedInspo.src} alt={selectedInspo.title} />
              : <span>{ICON_MAP[selectedInspo.category] || "💅"}</span>
            }
          </div>
          <div className="banner-info">
            <div className="banner-ttl">✨ {selectedInspo.title}</div>
            <div className="banner-auto">
              <strong>Авто-избрано:</strong> {[...(selectedInspo.autoServices||[]), ...(selectedInspo.autoAddons||[])].join(", ")}
            </div>
            <div className="banner-auto" style={{marginTop:"2px"}}>Можеш да добавиш още декорации по-долу 👇</div>
          </div>
          <button type="button" className="banner-x" onClick={() => onSelect(null)}>✕</button>
        </div>
      )}

      <p className="inspo-skip">
        Нямаш любим дизайн?{" "}
        <button type="button" onClick={() => onSelect(null)}>Избери услуги ръчно ↓</button>
      </p>
    </div>
  );
}
