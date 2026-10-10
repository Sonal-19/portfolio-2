import {
  $,
  $$,
  finePointer,
  gsap,
  on,
  onCleanup,
  randomGlyph,
  tickWhileVisible,
} from "./core";

/** Name letters decode from random glyphs, each settling at its own moment. */
export function heroIntro() {
  const tl = gsap.timeline();
  const chars = $$("[data-hero-char]");
  if (chars.length) {
    const state = chars.map((el, i) => ({
      el,
      final: el.dataset.c ?? "",
      settle: 0.25 + i * 0.07 + Math.random() * 0.25,
    }));
    const clock = { t: 0 };
    tl.set(chars, { opacity: 1 })
      .fromTo(
        chars,
        { yPercent: 40, filter: "blur(10px)" },
        {
          yPercent: 0,
          filter: "blur(0px)",
          duration: 1.1,
          stagger: { each: 0.05, from: "random" },
          ease: "expo.out",
        },
        0,
      )
      .to(
        clock,
        {
          t: 1.6,
          duration: 1.6,
          ease: "none",
          onUpdate: () => {
            for (const s of state) {
              if (clock.t >= s.settle) {
                if (s.el.textContent !== s.final) s.el.textContent = s.final;
              } else if (Math.random() > 0.4) s.el.textContent = randomGlyph();
            }
          },
          onComplete: () => {
            for (const s of state) s.el.textContent = s.final;
          },
        },
        0,
      );
  }
  const fades = $$("[data-hero-fade]");
  if (fades.length)
    tl.fromTo(
      fades,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out" },
      chars.length ? 0.7 : 0,
    );
  return tl;
}

/** Letters of the name push away from the cursor and spring back. */
export function heroRepel() {
  const hero = $("[data-hero]");
  if (!hero || !finePointer()) return;
  const chars = $$("[data-hero-char]", hero);
  const items = chars.map((el) => ({
    el,
    cx: 0,
    cy: 0,
    x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
    y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
    r: gsap.quickTo(el, "rotation", { duration: 0.8, ease: "power3.out" }),
  }));
  const measure = () => {
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      it.cx = r.left + r.width / 2 - (gsap.getProperty(it.el, "x") as number);
      it.cy = r.top + r.height / 2 - (gsap.getProperty(it.el, "y") as number);
    }
  };
  const R = 160;
  on(hero, "pointerenter", measure);
  on(hero, "pointermove", (e) => {
    for (const it of items) {
      const dx = it.cx - e.clientX;
      const dy = it.cy - e.clientY;
      const d = Math.hypot(dx, dy);
      if (d < R) {
        const f = (1 - d / R) ** 2;
        it.x((dx / (d || 1)) * f * 60);
        it.y((dy / (d || 1)) * f * 60);
        it.r((dx > 0 ? 1 : -1) * f * 18);
      } else {
        it.x(0);
        it.y(0);
        it.r(0);
      }
    }
  });
  on(hero, "pointerleave", () => {
    for (const it of items) {
      it.x(0);
      it.y(0);
      it.r(0);
    }
  });
  on(window, "scroll", measure, { passive: true });
}

/** Terminal-style role line: types, pauses, deletes, next. */
export function roleTyper(roles: readonly string[]) {
  const el = $("[data-role-typer]");
  if (!el || roles.length < 2) return;
  const seg = (role: string, from: number, to: number) => {
    const s = { n: from };
    return gsap.to(s, {
      n: to,
      duration: Math.abs(to - from) * (to > from ? 0.05 : 0.022),
      ease: "none",
      onUpdate: () => {
        el.textContent = role.slice(0, Math.round(s.n));
      },
    });
  };
  // The first role is server-rendered, so delete it first, then loop the rest.
  const order = [...roles.slice(1), roles[0]];
  const loop = gsap.timeline({ repeat: -1 });
  for (const role of order)
    loop
      .add(seg(role, 0, role.length))
      .to({}, { duration: 1.8 })
      .add(seg(role, role.length, 0))
      .to({}, { duration: 0.3 });
  gsap
    .timeline({ delay: 3.2 })
    .add(seg(roles[0], roles[0].length, 0))
    .to({}, { duration: 0.3 })
    .add(loop);
}

/** Hero content lifts, blurs and the grid recedes as you scroll past. */
export function heroScrollOut() {
  const hero = $("[data-hero]");
  const content = $("[data-hero-content]");
  const canvas = $("[data-hero-canvas]");
  if (!hero || !content) return;
  gsap
    .timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    })
    .to(
      content,
      { yPercent: -18, opacity: 0.1, filter: "blur(6px)", ease: "none" },
      0,
    )
    .to(canvas, { scale: 1.15, opacity: 0.2, ease: "none" }, 0);
}

/** Local time in Ludhiana. */
export function liveClock() {
  const el = $("[data-clock]");
  if (!el) return;
  const fmt = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  const update = () => {
    el.textContent = `${fmt.format(new Date())} IST`;
  };
  update();
  const id = window.setInterval(update, 1000);
  onCleanup(() => clearInterval(id));
}

export { tickWhileVisible };
