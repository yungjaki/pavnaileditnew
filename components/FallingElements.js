import { useEffect } from "react";

// Illustrations live in /public/art/falling/<name>.webp
const THEMES = {
  newYear:    ["firework", "champagne", "confetti", "sparkle"],
  halloween:  ["pumpkin", "ghost", "spiderweb"],
  christmas:  ["xmas-tree", "santa-hat", "snowflake", "gift"],
  valentines: ["heart", "heart-arrow", "rose"],
  easter:     ["easter-egg", "bunny", "blossom"],
  womensDay:  ["rose", "bouquet", "tulip"],
  birthday:   ["cake", "confetti", "champagne"],
  nameDay:    ["blossom", "rose", "sparkle", "confetti"],
  autumn:     ["maple-leaf", "oak-leaf"],
  winter:     ["snowflake"],
  spring:     ["blossom", "petal", "tulip"],
  summer:     ["sun", "palm-leaf", "watermelon"],
};

function getTheme() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if ((month === 12 && day === 31) || (month === 1 && day === 1)) return THEMES.newYear;
  if (month === 2 && day === 14) return THEMES.valentines;
  if (month === 3 && day === 8) return THEMES.womensDay;
  if (month === 4 && day === 10) return THEMES.birthday;
  if (month === 6 && day === 29) return THEMES.nameDay;
  if (month === 10 && day >= 25 && day <= 31) return THEMES.halloween;
  if (month === 12 && day >= 15) return THEMES.christmas;
  if (month === 4 && day >= 11 && day <= 20) return THEMES.easter;
  if ([9, 10, 11].includes(month)) return THEMES.autumn;
  if ([12, 1, 2].includes(month)) return THEMES.winter;
  if ([3, 4, 5].includes(month)) return THEMES.spring;
  if ([6, 7, 8].includes(month)) return THEMES.summer;
  return THEMES.spring;
}

export default function FallingElements() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const theme = getTheme();
    const MAX = 5;
    const INTERVAL = 2000;

    const create = () => {
      if (document.hidden) return;
      if (document.querySelectorAll(".fall-element").length >= MAX) return;
      const el = document.createElement("img");
      el.className = "fall-element";
      el.alt = "";
      el.setAttribute("aria-hidden", "true");
      el.decoding = "async";
      el.src = `/art/falling/${theme[Math.floor(Math.random() * theme.length)]}.webp`;
      const size = 18 + Math.random() * 20;
      el.style.width = el.style.height = size + "px";
      el.style.left = Math.random() * 100 + "vw";
      el.style.setProperty("--drift", (Math.random() * 80 - 40).toFixed(0) + "px");
      el.style.setProperty("--spin", (Math.random() * 360 - 180).toFixed(0) + "deg");
      el.style.animationDuration = 6 + Math.random() * 6 + "s";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 12000);
    };

    const id = setInterval(create, INTERVAL);
    return () => {
      clearInterval(id);
      document.querySelectorAll(".fall-element").forEach(el => el.remove());
    };
  }, []);

  return (
    <style jsx global>{`
      .fall-element {
        position: fixed;
        top: -50px;
        pointer-events: none;
        animation: falling linear forwards;
        z-index: 0;
        user-select: none;
        object-fit: contain;
        opacity: 0.9;
        filter: drop-shadow(0 4px 6px rgba(194, 24, 91, 0.12));
      }
      /* gentle drift and tumble, like a petal falling */
      @keyframes falling {
        0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10%  { opacity: 0.9; }
        50%  { transform: translate(var(--drift), 52vh) rotate(calc(var(--spin) / 2)); }
        85%  { opacity: 0.9; }
        100% { transform: translate(0, 105vh) rotate(var(--spin)); opacity: 0; }
      }
    `}</style>
  );
}
