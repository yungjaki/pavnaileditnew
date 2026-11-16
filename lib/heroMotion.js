// Signature "fresh coat of polish" entrance for the home hero.
// Only runs when the visitor has no reduced-motion preference.
import { gsap } from "gsap";

const MOTION_OK = "(prefers-reduced-motion: no-preference)";

function markDone() {
  document.documentElement.classList.add("motion-done");
}

/** Builds the hero timeline inside `root`. Returns a cleanup function. */
export function playHeroIntro(root) {
  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    // Wait for the splash screen, which only shows on the first visit of the session.
    // (Read before SplashScreen's own effect marks the session as seen.)
    let splashShowing = false;
    try {
      splashShowing = !!document.querySelector(".splash") && !sessionStorage.getItem("splashSeen");
    } catch {}
    const q = gsap.utils.selector(root);

    gsap.set(q(".gloss"), { skewX: -14 });

    const tl = gsap.timeline({
      delay: splashShowing ? 1.15 : 0.1,
      defaults: { ease: "power3.out" },
      onComplete: markDone,
    });

    tl.fromTo(q(".word"),
      { yPercent: 110, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.95, stagger: 0.08 })
      // The arch appears like a bare nail, then the "polish" is brushed on bottom-up.
      // (opacity only: the frame's transform belongs to the scroll parallax)
      .fromTo(q(".hero-photo"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.1)
      .fromTo(q(".hero-photo-clip"),
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "power4.inOut", clearProps: "clipPath" }, 0.3)
      .fromTo(q(".hero-photo-inner"), { scale: 1.14 }, { scale: 1, duration: 1.7, ease: "power3.out" }, 0.3)
      .fromTo(q(".rise"),
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.09 }, 0.5)
      // One glossy highlight glides across, like light catching wet gel.
      .fromTo(q(".gloss"),
        { xPercent: 0, autoAlpha: 1 },
        { xPercent: 420, duration: 1.2, ease: "power2.inOut" }, 1.2)
      .set(q(".gloss"), { autoAlpha: 0 });

    return () => tl.kill();
  });

  // Reduced motion: nothing animates; make sure nothing stays hidden.
  mm.add("(prefers-reduced-motion: reduce)", () => { markDone(); });

  return () => mm.revert();
}

/** Small gloss sweep across a button on hover. */
export function glossSweep(el) {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.fromTo(el,
    { xPercent: -120, skewX: -14, autoAlpha: 1 },
    { xPercent: 260, duration: 0.75, ease: "power2.out", overwrite: true });
}
