import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SIZE = 34;
const PAD = 8;
const SPRING = { stiffness: 380, damping: 32, mass: 0.6 };
const TARGETS = "a, button, [data-cursor], [data-sphere]";

/**
 * Crosshair cursor: a precise dot plus corner brackets that lag behind it.
 * Over links and buttons the brackets "lock on" and wrap the element,
 * and a mono readout shows coordinates or the element's data-cursor label.
 */
export default function Cursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const x = useSpring(-100, SPRING);
  const y = useSpring(-100, SPRING);
  const w = useSpring(SIZE, SPRING);
  const h = useSpring(SIZE, SPRING);
  const [visible, setVisible] = useState(false);
  const [locked, setLocked] = useState(false);
  const [label, setLabel] = useState("");
  const coords = useRef<HTMLSpanElement>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let target: HTMLElement | null = null;
    let px = -100;
    let py = -100;

    const lockTo = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      x.set(r.left - PAD);
      y.set(r.top - PAD);
      w.set(r.width + PAD * 2);
      h.set(r.height + PAD * 2);
    };
    const free = () => {
      x.set(px - SIZE / 2);
      y.set(py - SIZE / 2);
      w.set(SIZE);
      h.set(SIZE);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      dotX.set(px);
      dotY.set(py);
      setVisible(true);
      const el = (e.target as HTMLElement).closest<HTMLElement>(TARGETS);
      const lockable =
        el && !el.matches("[data-sphere]") && el.offsetWidth < 520;
      if (el !== target) {
        target = el;
        lockedRef.current = Boolean(lockable);
        setLocked(lockedRef.current);
        setLabel(
          el?.dataset.cursor ??
            (el?.matches("[data-sphere]") ? "drag" : el ? "click" : ""),
        );
      }
      if (lockable && el) lockTo(el);
      else free();
      if (coords.current && !el)
        coords.current.textContent = `x:${String(Math.round(px)).padStart(4, "0")} y:${String(Math.round(py)).padStart(4, "0")}`;
    };
    const onScroll = () => {
      if (target && lockedRef.current) lockTo(target);
    };
    const leave = () => setVisible(false);
    const down = () => {
      w.set(w.get() * 0.85);
      h.set(h.get() * 0.85);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", down);
    document.documentElement.addEventListener("pointerleave", leave);
    const reset = () => {
      target = null;
      lockedRef.current = false;
      setLocked(false);
      setLabel("");
    };
    document.addEventListener("astro:after-swap", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("astro:after-swap", reset);
    };
  }, [dotX, dotY, x, y, w, h]);

  const corner = "absolute size-2.5 border-[var(--accent)]";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[400] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="absolute top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]"
        style={{ x: dotX, y: dotY }}
      />
      <motion.div
        className={`absolute top-0 left-0 transition-opacity ${locked ? "opacity-100" : "opacity-80"}`}
        style={{ x, y, width: w, height: h }}
      >
        <span
          className={`${corner} top-0 left-0 border-t-[1.5px] border-l-[1.5px]`}
        />
        <span
          className={`${corner} top-0 right-0 border-t-[1.5px] border-r-[1.5px]`}
        />
        <span
          className={`${corner} bottom-0 left-0 border-b-[1.5px] border-l-[1.5px]`}
        />
        <span
          className={`${corner} right-0 bottom-0 border-r-[1.5px] border-b-[1.5px]`}
        />
        <span className="absolute top-full left-0 mt-1.5 rounded bg-[var(--accent)] px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-[var(--accent-ink)]">
          {label || <span ref={coords} />}
        </span>
      </motion.div>
    </div>
  );
}
