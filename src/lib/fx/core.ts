import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
gsap.config({ nullTargetWarn: false });
gsap.defaults({ ease: "power4.out" });

export { gsap, ScrollTrigger, SplitText };

export const $ = <T extends Element = HTMLElement>(
  sel: string,
  root: ParentNode = document,
) => root.querySelector<T>(sel);
export const $$ = <T extends Element = HTMLElement>(
  sel: string,
  root: ParentNode = document,
) => Array.from(root.querySelectorAll<T>(sel));

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;
export const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

export const GLYPHS = "!<>-_\\/[]{}—=+*^?#01ABCDEFxyz$";
export const randomGlyph = () =>
  GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/* Per-page cleanup: listeners, tickers, observers, timers. */
let controller = new AbortController();
const cleanups: (() => void)[] = [];

export const signal = () => controller.signal;

export function on<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  fn: (e: WindowEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): void;
export function on<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  fn: (e: DocumentEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): void;
export function on<K extends keyof HTMLElementEventMap>(
  target: Element,
  type: K,
  fn: (e: HTMLElementEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): void;
export function on(
  target: EventTarget,
  type: string,
  fn: (e: Event) => void,
  opts: AddEventListenerOptions = {},
) {
  target.addEventListener(type, fn, { ...opts, signal: controller.signal });
}

export const onCleanup = (fn: () => void) => {
  cleanups.push(fn);
};

/** Runs `fn` on the gsap ticker only while `el` is on screen and the tab is visible. */
export function tickWhileVisible(el: Element, fn: (time: number) => void) {
  let visible = false;
  let running = false;
  const sync = () => {
    const should = visible && !document.hidden;
    if (should && !running) gsap.ticker.add(fn);
    if (!should && running) gsap.ticker.remove(fn);
    running = should;
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  io.observe(el);
  on(document, "visibilitychange", sync);
  onCleanup(() => {
    io.disconnect();
    gsap.ticker.remove(fn);
  });
}

export function resetCleanup() {
  controller.abort();
  for (const fn of cleanups.splice(0)) fn();
  controller = new AbortController();
}

/** Reads a CSS custom property off <html> (theme-aware colours for canvas). */
export const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
