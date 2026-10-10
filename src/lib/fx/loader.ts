import { $, $$, gsap } from "./core";

/** Boot sequence: terminal lines type out, counter fills, then the tile grid flips away from the centre. */
export function loaderTimeline(onStart: () => void, onDone: () => void) {
  const loader = $("[data-loader]");
  if (!loader || getComputedStyle(loader).display === "none") return null;
  onStart();
  const lines = $$("[data-loader-line]", loader);
  const tiles = $$("[data-loader-tile]", loader);
  const term = $("[data-loader-term]", loader);
  const count = $("[data-loader-count]", loader);
  const bar = $("[data-loader-bar]", loader);
  const texts = lines.map((l) => l.textContent ?? "");
  for (const l of lines) l.textContent = "";

  const tl = gsap.timeline({
    onComplete: () => {
      loader.style.display = "none";
      document.documentElement.classList.add("loader-seen");
      try {
        sessionStorage.setItem("boot-seen", "1");
      } catch {}
      onDone();
    },
  });

  tl.from(term, {
    y: 30,
    opacity: 0,
    scale: 0.96,
    duration: 0.6,
    ease: "expo.out",
  });
  let at = 0.3;
  lines.forEach((l, i) => {
    const text = texts[i];
    const s = { n: 0 };
    const dur = i === 0 ? 0.55 : 0.28;
    tl.to(
      s,
      {
        n: text.length,
        duration: dur,
        ease: "none",
        onUpdate: () => {
          l.textContent = text.slice(0, Math.round(s.n));
        },
      },
      at,
    );
    at += dur + (i === 0 ? 0.15 : 0.08);
  });
  const n = { v: 0 };
  tl.to(
    n,
    {
      v: 100,
      duration: at - 0.3,
      ease: "power2.inOut",
      onUpdate: () => {
        if (count) count.textContent = String(Math.round(n.v));
      },
    },
    0.3,
  );
  tl.to(bar, { scaleX: 1, duration: at - 0.3, ease: "power2.inOut" }, 0.3);

  tl.to(
    term,
    { scale: 0.92, opacity: 0, duration: 0.45, ease: "power3.in" },
    at + 0.15,
  );
  tl.to(
    tiles,
    {
      rotationX: -90,
      scale: 0.6,
      opacity: 0,
      duration: 0.7,
      ease: "power3.inOut",
      stagger: { grid: [8, 8], from: "center", amount: 0.55 },
    },
    at + 0.35,
  );
  return tl;
}
