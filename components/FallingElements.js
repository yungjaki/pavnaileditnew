import { useEffect } from "react";

const THEMES = {
  newYear:    ["🎆", "🎇", "🥂", "🎉"],
  halloween:  ["🎃", "👻", "🕸️"],
  christmas:  ["🎄", "🎅", "❄️", "🎁"],
  valentines: ["❤️", "💘", "💝"],
  easter:     ["🥚", "🐰", "🌸"],
  womensDay:  ["🌹", "💐", "👩‍🦰"],
  birthday:   ["🎂", "🎉", "🥂"],
  nameDay:    ["🌸", "🌹", "✨", "🎉"],
  autumn:     ["🍂", "🍁"],
  winter:     ["❄️"],
  spring:     ["🌸", "🌷"],
  summer:     ["☀️", "🌴", "🍉"],
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
    const theme = getTheme();
    const MAX = 7;
    const INTERVAL = 1500;

    const create = () => {
      if (document.querySelectorAll(".fall-element").length >= MAX) return;
      const el = document.createElement("div");
      el.className = "fall-element";
      el.textContent = theme[Math.floor(Math.random() * theme.length)];
      el.style.left = Math.random() * 100 + "vw";
      el.style.fontSize = 12 + Math.random() * 18 + "px";
      el.style.animationDuration = 4 + Math.random() * 6 + "s";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 12000);
    };

    const id = setInterval(create, INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <style>{`
      .fall-element {
        position: fixed;
        top: -50px;
        pointer-events: none;
        animation: falling linear forwards;
        z-index: 0;
        user-select: none;
      }
      @keyframes falling {
        0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
        80%  { opacity: 1; }
        100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
      }
    `}</style>
  );
}
