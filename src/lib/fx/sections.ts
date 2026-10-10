import {
  $,
  $$,
  finePointer,
  gsap,
  on,
  onCleanup,
  ScrollTrigger,
  SplitText,
} from "./core";

/* ------------------------------------------------------------------ */
/* Generic reveals                                                     */
/* ------------------------------------------------------------------ */

export function reveals() {
  for (const el of $$("[data-reveal]"))
    gsap.fromTo(
      el,
      { opacity: 0, y: 40, clipPath: "inset(0% 0% 18% 0%)" },
      {
        opacity: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      },
    );

  for (const group of $$("[data-stagger]"))
    gsap.fromTo(
      group.children,
      { opacity: 0, x: -24 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.07,
        ease: "expo.out",
        scrollTrigger: {
          trigger: group,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      },
    );

  for (const line of $$("[data-draw]"))
    gsap.from(line, {
      scaleX: 0,
      transformOrigin: "left",
      duration: 1.2,
      ease: "expo.inOut",
      scrollTrigger: {
        trigger: line,
        start: "top 92%",
        toggleActions: "play none none none",
      },
    });

  // Chips flip in around the Y axis like cards being dealt.
  for (const group of $$("[data-flip]"))
    gsap.fromTo(
      group.children,
      { opacity: 0, rotationY: -90, transformOrigin: "left center" },
      {
        opacity: 1,
        rotationY: 0,
        duration: 0.9,
        stagger: 0.06,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: group,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      },
    );
}

/** Headings: an accent block sweeps across each line, revealing the text behind it. */
export function wipeHeadings() {
  for (const h of $$("[data-wipe]")) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: h,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
    $$(".wipe", h).forEach((w, i) => {
      const block = $(".wipe-block", w);
      const text = $(".wipe-text", w);
      const at = i * 0.14;
      tl.set(block, { transformOrigin: "left" }, at)
        .to(block, { scaleX: 1, duration: 0.55, ease: "expo.inOut" }, at)
        .set(text, { opacity: 1 }, at + 0.55)
        .set(block, { transformOrigin: "right" }, at + 0.55)
        .to(
          block,
          { scaleX: 0, duration: 0.55, ease: "expo.inOut" },
          at + 0.55,
        );
    });
  }
}

/** Paragraphs rise line by line out of a mask; marked phrases get an underline sweep. */
export function lineReveals() {
  for (const p of $$("[data-lines]")) {
    const split = SplitText.create(p, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
    });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.1,
      stagger: 0.08,
      ease: "expo.out",
      scrollTrigger: {
        trigger: p,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
    const marks = $$("mark[data-hl]", p);
    if (marks.length)
      gsap.to(marks, {
        "--hl": "100%",
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: p,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });
    onCleanup(() => split.revert());
  }
}

/** Grid background drifts slower than the page. */
export function gridParallax() {
  const root = document.documentElement;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      root.style.setProperty("--grid-y", `${-(self.scroll() * 0.15) % 56}px`);
    },
  });
  onCleanup(() => root.style.removeProperty("--grid-y"));
}

/* ------------------------------------------------------------------ */
/* Projects: sticky stacking cards                                     */
/* ------------------------------------------------------------------ */

export function projectStack() {
  const cards = $$("[data-stack-card]");
  // A card taller than the viewport sticks higher (even partly off the top)
  // so its bottom, with the buttons, is on screen before the next card covers it.
  const setTops = () => {
    const rem = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    cards.forEach((card, i) => {
      const base = (5.5 + i * 1.1) * rem;
      card.style.top = `${Math.min(base, window.innerHeight - card.offsetHeight - rem)}px`;
    });
  };
  setTops();
  ScrollTrigger.addEventListener("refreshInit", setTops);
  onCleanup(() => {
    ScrollTrigger.removeEventListener("refreshInit", setTops);
    for (const c of cards) c.style.removeProperty("top");
  });

  cards.forEach((card, i) => {
    const inner = $("[data-stack-inner]", card);
    const dim = $("[data-stack-dim]", card);
    // Each card rises in with a slight 3D tilt.
    gsap.from(inner, {
      y: 120,
      rotationX: 12,
      transformPerspective: 1400,
      transformOrigin: "center top",
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: {
        trigger: card,
        start: "top 92%",
        toggleActions: "play none none none",
      },
    });
    const next = cards[i + 1];
    if (!next || getComputedStyle(card).position !== "sticky") return;
    // As the next card slides over, this one shrinks back and dims.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: next,
          start: "top bottom",
          end: () =>
            `top ${Number.parseFloat(getComputedStyle(next).top) || 100}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      .to(inner, { scale: 0.9 + i * 0.015, ease: "none" }, 0)
      .to(dim, { opacity: 0.55, ease: "none" }, 0);
  });
}

/* ------------------------------------------------------------------ */
/* Experience: git log graph                                           */
/* ------------------------------------------------------------------ */

export function gitLog() {
  const list = $("[data-git]");
  if (!list) return;
  const line = $("[data-git-line]", list);
  gsap.fromTo(
    line,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: list,
        start: "top 70%",
        end: "bottom 70%",
        scrub: 0.6,
      },
    },
  );

  for (const c of $$("[data-commit]", list)) {
    const hash = $("[data-commit-hash]", c);
    const date = $("[data-commit-date]", c);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: c,
        start: "top 78%",
        toggleActions: "play none none none",
      },
    });
    tl.from($("[data-commit-node]", c), {
      scale: 0,
      duration: 0.6,
      ease: "back.out(3)",
    })
      .to(
        hash,
        {
          duration: 0.8,
          scrambleText: {
            text: hash?.dataset.hash ?? "",
            chars: "0123456789abcdef",
            speed: 0.6,
          },
        },
        0,
      )
      .to(
        date,
        {
          duration: 0.8,
          scrambleText: {
            text: date?.textContent ?? "",
            chars: "0123456789—",
            speed: 0.5,
          },
        },
        0.1,
      )
      .from(
        [$("[data-commit-title]", c), $("[data-commit-sub]", c)],
        { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out" },
        0.15,
      )
      .fromTo(
        $$("[data-commit-diff]", c),
        {
          x: -30,
          opacity: 0,
          backgroundColor:
            "color-mix(in oklab, var(--accent) 22%, transparent)",
        },
        {
          x: 0,
          opacity: 1,
          backgroundColor: "color-mix(in oklab, var(--accent) 0%, transparent)",
          duration: 1.1,
          stagger: 0.1,
          ease: "expo.out",
        },
        0.3,
      )
      .from(
        $$("[data-commit-tag]", c),
        {
          scale: 0.6,
          opacity: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: "back.out(2)",
        },
        0.5,
      );
  }
}

/* ------------------------------------------------------------------ */
/* About: typed prompt + JSON typing                                   */
/* ------------------------------------------------------------------ */

export function typing() {
  for (const el of $$("[data-type]")) {
    const text = el.dataset.type ?? "";
    const s = { n: 0 };
    el.textContent = "";
    gsap.to(s, {
      n: text.length,
      duration: text.length * 0.06,
      ease: "none",
      onUpdate: () => {
        el.textContent = text.slice(0, Math.round(s.n));
      },
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  }

  const json = $("[data-json]");
  if (json) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: json,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
    for (const line of $$("[data-json-line]", json)) {
      const len = Math.max(1, (line.textContent ?? "").length);
      tl.fromTo(
        line,
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: len * 0.022,
          ease: `steps(${len})`,
        },
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export function springHeadline() {
  const h = $("[data-spring]");
  if (!h) return;
  const chars = $$("[data-spring-char]", h);
  gsap.from(chars, {
    yPercent: -120,
    rotation: () => gsap.utils.random(-40, 40),
    opacity: 0,
    duration: 1.4,
    ease: "elastic.out(1, 0.45)",
    stagger: { each: 0.04, from: "random" },
    scrollTrigger: {
      trigger: h,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });

  const boing = (c: HTMLElement) => {
    if (gsap.isTweening(c)) return;
    gsap
      .timeline()
      .to(c, {
        y: gsap.utils.random(-40, -18),
        rotation: gsap.utils.random(-25, 25),
        scaleY: 1.12,
        duration: 0.18,
        ease: "power2.out",
      })
      .to(c, {
        y: 0,
        rotation: 0,
        scaleY: 1,
        duration: 1,
        ease: "elastic.out(1.2, 0.3)",
      });
  };
  for (const c of chars) {
    if (finePointer()) on(c, "pointerenter", () => boing(c));
    else on(c, "pointerdown", () => boing(c));
  }
}

export function copyButtons() {
  for (const btn of $$<HTMLButtonElement>("[data-copy]")) {
    const label = $("[data-copy-label]", btn);
    on(btn, "click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? "");
      } catch {
        return;
      }
      if (!label) return;
      gsap
        .timeline()
        .to(label, {
          duration: 0.5,
          scrambleText: { text: "copied ✓", chars: "01", speed: 0.8 },
        })
        .to(
          btn,
          {
            borderColor: "var(--accent)",
            color: "var(--accent)",
            duration: 0.2,
          },
          0,
        )
        .to(label, {
          delay: 1.6,
          duration: 0.4,
          scrambleText: { text: "copy", chars: "01" },
        })
        .to(btn, { clearProps: "borderColor,color", duration: 0 });
    });
  }
}

/* ------------------------------------------------------------------ */
/* Footer marquee: speed and skew follow scroll velocity               */
/* ------------------------------------------------------------------ */

export function velocityMarquee() {
  const track = $("[data-marquee]");
  if (!track) return;
  const loop = gsap.to(track, {
    xPercent: -50,
    duration: 30,
    ease: "none",
    repeat: -1,
  });
  const skew = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power3" });
  let dir = 1;
  let settle = 0;
  onCleanup(() => clearTimeout(settle));
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const v = self.getVelocity();
      if (self.direction !== dir) dir = self.direction;
      gsap.to(loop, {
        timeScale: dir * gsap.utils.clamp(1, 6, 1 + Math.abs(v) / 400),
        duration: 0.2,
        overwrite: true,
      });
      gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.25 });
      skew(gsap.utils.clamp(-12, 12, v / -250));
      clearTimeout(settle);
      settle = window.setTimeout(() => skew(0), 140);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Projects: "more work" grid + screenshot scanlines                   */
/* ------------------------------------------------------------------ */

const scan = (el: HTMLElement | null, delay = 0) => {
  if (!el) return;
  gsap.fromTo(
    el,
    { top: "0%", opacity: 1 },
    {
      top: "100%",
      opacity: 0,
      duration: 1.3,
      ease: "power2.inOut",
      delay,
      overwrite: true,
    },
  );
};

/** Grid cards tip up out of the page in batches; screenshots get a scanline pass. */
export function projectGrid() {
  const cards = $$("[data-grid-card]");
  if (!cards.length) return;
  gsap.set(cards, {
    opacity: 0,
    y: 80,
    rotationX: -18,
    transformPerspective: 1200,
    transformOrigin: "center top",
  });
  ScrollTrigger.batch(cards, {
    start: "top 92%",
    onEnter: (batch) => {
      const fresh = (batch as HTMLElement[]).filter((c) => !c.dataset.shown);
      for (const c of fresh) c.dataset.shown = "1";
      gsap.to(fresh, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: "expo.out",
      });
      fresh.forEach((c, i) => {
        scan($(".cover-scan", c), 0.35 + i * 0.1);
      });
    },
  });
}

/** Mouse users get a scanline sweep each time they hover a screenshot. */
export function coverScans() {
  if (!finePointer()) return;
  for (const s of $$(".cover-scan")) {
    const group = s.closest<HTMLElement>(".group");
    if (group) on(group, "pointerenter", () => scan(s));
  }
}
