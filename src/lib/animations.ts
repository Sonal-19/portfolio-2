import Lenis from "lenis";
import { profile } from "@/data/profile";
import { mobileMenu, navChrome, scrambleHover, themeToggle } from "./fx/chrome";
import {
  $,
  gsap,
  prefersReducedMotion,
  resetCleanup,
  ScrollTrigger,
} from "./fx/core";
import {
  heroIntro,
  heroRepel,
  heroScrollOut,
  liveClock,
  roleTyper,
} from "./fx/hero";
import { loaderTimeline } from "./fx/loader";
import { heroNetwork } from "./fx/network";
import {
  copyButtons,
  coverScans,
  gitLog,
  gridParallax,
  lineReveals,
  projectGrid,
  projectStack,
  reveals,
  springHeadline,
  typing,
  velocityMarquee,
  wipeHeadings,
} from "./fx/sections";
import { tagSphere } from "./fx/sphere";

export { prefersReducedMotion };

let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;

function startLenis() {
  // Touch devices keep native momentum scrolling (syncTouch off).
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function initPage() {
  const reduced = prefersReducedMotion();
  document.documentElement.classList.toggle("js-motion", !reduced);
  document.documentElement.classList.toggle(
    "has-cursor",
    window.matchMedia("(pointer: fine)").matches && !reduced,
  );

  // Works with or without motion.
  liveClock();
  themeToggle(reduced);
  mobileMenu(() => lenis, reduced);
  copyButtons();
  if (reduced) return;

  if (!lenis) startLenis();
  if (location.hash) {
    const hash = location.hash;
    requestAnimationFrame(() => scrollToTarget(hash));
  } else lenis?.scrollTo(0, { immediate: true });

  ctx = gsap.context(() => {
    const intro = gsap.timeline();
    const loader = loaderTimeline(
      () => lenis?.stop(),
      () => lenis?.start(),
    );
    if (loader) intro.add(loader);
    intro.add(heroIntro(), loader ? "-=0.6" : 0.1);

    const canvas = $<HTMLCanvasElement>("[data-hero-canvas]");
    if (canvas) heroNetwork(canvas);
    heroRepel();
    roleTyper(profile.roles);
    heroScrollOut();

    navChrome();
    scrambleHover();
    gridParallax();
    reveals();
    wipeHeadings();
    lineReveals();
    projectStack();
    projectGrid();
    coverScans();
    gitLog();
    tagSphere();
    typing();
    springHeadline();
    velocityMarquee();
  });

  // Fonts can shift layout after first paint.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export function destroyPage() {
  resetCleanup();
  ctx?.revert();
  ctx = null;
  for (const t of ScrollTrigger.getAll()) t.kill();
}

export function scrollToTarget(target: string) {
  const el = document.querySelector<HTMLElement>(target);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: target === "#main" ? 0 : -20 });
  else el.scrollIntoView({ behavior: "smooth" });
}
