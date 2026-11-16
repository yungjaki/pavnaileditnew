import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem("splashSeen"); } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Once per session, never for people who asked for less motion.
    if (seen || reduced) {
      setVisible(false);
      return;
    }
    try { sessionStorage.setItem("splashSeen", "1"); } catch {}
    const fadeTimer = setTimeout(() => setFading(true), 1100);
    const hideTimer = setTimeout(() => setVisible(false), 1500);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div className={`splash ${fading ? "splash-fade" : ""}`} aria-hidden="true" onClick={dismiss}>
      <style jsx>{`

        .splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #fff0f8;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
          transition: opacity 0.5s ease;
          overflow: hidden;
        }
        .splash-fade { opacity: 0; pointer-events: none; }

        /* background blobs */
        .splash-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: blobFloat 4s ease-in-out infinite alternate;
        }
        .splash-blob-1 { width:340px; height:340px; background:#f8b7d1; top:-80px; right:-80px; animation-delay:0s; }
        .splash-blob-2 { width:260px; height:260px; background:#ffd6e8; bottom:-60px; left:-60px; animation-delay:1s; }
        .splash-blob-3 { width:180px; height:180px; background:#ff6ec4; top:40%; left:10%; opacity:0.2; animation-delay:0.5s; }
        @keyframes blobFloat {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(20px, 20px) scale(1.08); }
        }

        /* nail polish bottle (illustration): a pale copy, with the coloured one "filling" bottom-up */
        .nail-bottle {
          position: relative;
          width: 96px;
          height: 120px;
          margin-bottom: 24px;
          animation: bottleAppear 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
          opacity: 0;
        }
        @keyframes bottleAppear {
          from { opacity:0; transform:translateY(20px) scale(0.85); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }
        .bottle-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
        .bottle-empty { filter: grayscale(1) brightness(1.25); opacity: 0.35; }
        .bottle-full {
          clip-path: inset(100% 0 0 0);
          animation: fillUp 0.8s cubic-bezier(0.65,0,0.35,1) 0.2s forwards;
        }
        @keyframes fillUp { to { clip-path: inset(0 0 0 0); } }

        /* sparkles */
        .sparkles {
          position: absolute; width: 56px; height: 56px; top: -18px; right: -40px;
          object-fit: contain; opacity: 0;
          animation: sparklePop 0.4s cubic-bezier(0.22,1,0.36,1) 0.8s forwards;
        }
        @keyframes sparklePop {
          0%   { opacity:0; transform:scale(0.4) rotate(-10deg); }
          100% { opacity:1; transform:scale(1) rotate(0deg); }
        }
        /* text */
        .splash-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.6rem;
          font-weight: 300;
          color: #c94090;
          letter-spacing: 2px;
          margin: 0;
          animation: textAppear 0.6s ease 0.3s forwards;
          opacity: 0;
          position: relative;
          z-index: 1;
        }
        .splash-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #e0a0c0;
          margin: 8px 0 0;
          animation: textAppear 0.6s ease 0.5s forwards;
          opacity: 0;
          position: relative;
          z-index: 1;
        }
        @keyframes textAppear {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* loading dots */
        .splash-dots {
          display: flex; gap: 6px; margin-top: 32px;
          animation: textAppear 0.5s ease 0.7s forwards;
          opacity: 0;
          position: relative; z-index: 1;
        }
        .splash-dot {
          width: 7px; height: 7px;
          background: #f8b7d1;
          border-radius: 50%;
          animation: dotPulse 1.2s ease-in-out infinite;
        }
        .splash-dot:nth-child(2) { animation-delay: 0.2s; background:#ff6ec4; }
        .splash-dot:nth-child(3) { animation-delay: 0.4s; background:#c94090; }
        @keyframes dotPulse {
          0%,100% { transform:scale(1);   opacity:0.5; }
          50%     { transform:scale(1.5); opacity:1; }
        }
      `}</style>

      {/* Background blobs */}
      <div className="splash-blob splash-blob-1" />
      <div className="splash-blob splash-blob-2" />
      <div className="splash-blob splash-blob-3" />

      {/* Nail polish bottle */}
      <div className="nail-bottle">
        <img className="bottle-img bottle-empty" src="/art/splash/polish-bottle.webp" alt="" />
        <img className="bottle-img bottle-full" src="/art/splash/polish-bottle.webp" alt="" />
        <img className="sparkles" src="/art/splash/sparkle-cluster.webp" alt="" />
      </div>

      <h1 className="splash-title">PavNailedIt</h1>
      <p className="splash-sub">nail studio</p>

      <div className="splash-dots">
        <div className="splash-dot" />
        <div className="splash-dot" />
        <div className="splash-dot" />
      </div>
    </div>
  );
}
