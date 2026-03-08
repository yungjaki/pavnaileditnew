import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);

  useEffect(() => {
    // Don't show again in same session
    if (sessionStorage.getItem("splashSeen")) {
      setVisible(false);
      return;
    }
    const fadeTimer = setTimeout(() => setFading(true), 2200);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("splashSeen", "1");
    }, 2700);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`splash ${fading ? "splash-fade" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');

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

        /* nail polish bottle */
        .nail-bottle {
          position: relative;
          width: 56px;
          height: 96px;
          margin-bottom: 28px;
          animation: bottleAppear 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
          opacity: 0;
        }
        @keyframes bottleAppear {
          from { opacity:0; transform:translateY(20px) scale(0.8); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }

        /* bottle cap */
        .bottle-cap {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 18px; height: 28px;
          background: linear-gradient(180deg, #c94090, #e0559e);
          border-radius: 4px 4px 2px 2px;
        }
        .bottle-cap::after {
          content:'';
          position:absolute;
          bottom:-6px; left:50%;
          transform:translateX(-50%);
          width:8px; height:8px;
          background:#e0559e;
          border-radius:1px;
        }

        /* bottle body */
        .bottle-body {
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 44px; height: 68px;
          border-radius: 6px 6px 10px 10px;
          background: linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,200,230,0.1));
          border: 2px solid rgba(255,110,196,0.4);
          overflow: hidden;
        }

        /* liquid fill animation */
        .bottle-liquid {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(180deg, #ff85bc, #ff6ec4, #f8b7d1);
          border-radius: 0 0 8px 8px;
          animation: fillUp 1.8s cubic-bezier(0.4,0,0.2,1) 0.3s forwards;
          height: 0;
        }
        @keyframes fillUp {
          0%   { height: 0; }
          100% { height: 90%; }
        }

        /* shimmer on bottle */
        .bottle-shine {
          position: absolute;
          top: 8px; left: 10px;
          width: 6px; height: 28px;
          background: linear-gradient(180deg, rgba(255,255,255,0.7), transparent);
          border-radius: 3px;
          transform: rotate(-15deg);
        }

        /* sparkles */
        .sparkle {
          position: absolute;
          font-size: 1rem;
          animation: sparklePop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
          opacity: 0;
        }
        .sp1 { top:-10px; right:-18px; animation-delay:1.4s; font-size:0.8rem; }
        .sp2 { bottom:10px; right:-20px; animation-delay:1.6s; }
        .sp3 { bottom:5px;  left:-18px;  animation-delay:1.5s; font-size:0.75rem; }
        @keyframes sparklePop {
          0%   { opacity:0; transform:scale(0) rotate(0deg); }
          60%  { opacity:1; transform:scale(1.3) rotate(20deg); }
          100% { opacity:1; transform:scale(1) rotate(15deg); }
        }

        /* text */
        .splash-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.6rem;
          font-weight: 300;
          color: #c94090;
          letter-spacing: 2px;
          margin: 0;
          animation: textAppear 0.8s ease 0.5s forwards;
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
          animation: textAppear 0.8s ease 0.8s forwards;
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
          animation: textAppear 0.8s ease 1.2s forwards;
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
        <div className="bottle-cap" />
        <div className="bottle-body">
          <div className="bottle-liquid" />
          <div className="bottle-shine" />
        </div>
        <span className="sparkle sp1">✨</span>
        <span className="sparkle sp2">💫</span>
        <span className="sparkle sp3">✦</span>
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
