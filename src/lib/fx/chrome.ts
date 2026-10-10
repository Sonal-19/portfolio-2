import type Lenis from "lenis";
import { $, $$, finePointer, gsap, on, ScrollTrigger } from "./core";

/** Nav pill shrinks once scrolled, hides on scroll down; progress bar; active section link. */
export function navChrome() {
  const nav = $("[data-nav]");
  const bar = $("[data-progress]");
  let last = 0;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      if (nav) {
        nav.dataset.scrolled = String(y > 60);
        nav.dataset.hidden = String(y > last + 2 && y > 500);
      }
      if (bar) gsap.set(bar, { scaleY: self.progress });
      last = y;
    },
  });

  for (const section of $$("[data-section]")) {
    const link = $(`[data-nav-link="${section.dataset.section}"]`);
    if (!link) continue;
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => {
        link.dataset.active = String(self.isActive);
      },
    });
  }
}

/** Mono links decode through random characters on hover. */
export function scrambleHover() {
  if (!finePointer()) return;
  for (const el of $$("[data-scramble-hover]")) {
    const text = el.textContent?.trim() ?? "";
    on(el, "pointerenter", () => {
      gsap.to(el, {
        duration: 0.5,
        scrambleText: { text, chars: "01<>/_", speed: 0.7 },
        overwrite: true,
      });
    });
  }
}

/** Full-screen mobile menu that opens as a circle growing out of the menu button. */
export function mobileMenu(getLenis: () => Lenis | null, reduced: boolean) {
  const menu = $("[data-menu]");
  const openBtn = $("[data-menu-open]");
  const closeBtn = $("[data-menu-close]");
  if (!menu || !openBtn || !closeBtn) return;
  const links = $$("[data-menu-link]", menu);
  const origin = "calc(100% - 2.25rem) 2.25rem";
  let isOpen = false;

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    openBtn.setAttribute("aria-expanded", "true");
    getLenis()?.stop();
    gsap.set(menu, { visibility: "visible" });
    if (reduced) {
      gsap.set(menu, { clipPath: `circle(150% at ${origin})` });
      return;
    }
    gsap
      .timeline()
      .to(menu, {
        clipPath: `circle(150% at ${origin})`,
        duration: 0.9,
        ease: "expo.inOut",
      })
      .fromTo(
        links,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.06,
          ease: "expo.out",
        },
        0.35,
      );
    closeBtn.focus();
  };
  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    openBtn.setAttribute("aria-expanded", "false");
    getLenis()?.start();
    gsap.to(menu, {
      clipPath: `circle(0% at ${origin})`,
      duration: reduced ? 0 : 0.7,
      ease: "expo.inOut",
      onComplete: () => {
        gsap.set(menu, { visibility: "hidden" });
      },
    });
  };
  on(openBtn, "click", open);
  on(closeBtn, "click", close);
  for (const l of links) on(l, "click", close);
  on(document, "keydown", (e) => {
    if (e.key === "Escape") close();
  });
  on(window, "resize", () => {
    if (window.innerWidth >= 1024) close();
  });
}

/** Theme switch: the new theme spreads as a circle from the button. */
export function themeToggle(reduced: boolean) {
  const btn = $("[data-theme-toggle]");
  if (!btn) return;
  const root = document.documentElement;
  on(btn, "click", (e) => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {}
    };
    if (reduced || !document.startViewTransition) {
      apply();
      return;
    }
    const r = btn.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2;
    const y = e.clientY || r.top + r.height / 2;
    const end = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );
    root.classList.add("theme-switching");
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${end}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 750,
          easing: "cubic-bezier(.65,0,.35,1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
    vt.finished.finally(() => root.classList.remove("theme-switching"));
  });
}
