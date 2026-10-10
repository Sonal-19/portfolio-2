import { cssVar, gsap, on, onCleanup, tickWhileVisible } from "./core";

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Packet = { a: Node; b: Node; t: number; speed: number; hue: 0 | 1 };
type Ring = { x: number; y: number; t: number };

/**
 * Hero background: a drifting API graph. Nearby nodes link up, the pointer
 * acts as a hub that pulls links toward it, data packets travel along edges,
 * and a click/tap fires a burst of packets plus a ripple ring.
 */
export function heroNetwork(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const small = () => window.innerWidth < 768;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let link = 140;
  let nodes: Node[] = [];
  const packets: Packet[] = [];
  const rings: Ring[] = [];
  const pointer = { x: -9999, y: -9999, active: false };
  let colours = readColours();
  let frame = 0;
  let lastSpawn = 0;

  function readColours() {
    return {
      line: cssVar("--muted") || "#8591a0",
      accent: cssVar("--accent") || "#c6ff3d",
      cyan: cssVar("--cyan") || "#3de0ff",
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    link = small() ? 110 : 150;
    const count = Math.round(
      Math.min(
        small() ? 46 : 110,
        Math.max(28, (w * h) / (small() ? 9000 : 13000)),
      ),
    );
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8,
    }));
    packets.length = 0;
  }

  function neighbours(n: Node) {
    return nodes.filter(
      (m) => m !== n && (m.x - n.x) ** 2 + (m.y - n.y) ** 2 < link * link,
    );
  }

  function spawnPacket() {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const near = neighbours(a);
    if (!near.length) return;
    const b = near[Math.floor(Math.random() * near.length)];
    packets.push({
      a,
      b,
      t: 0,
      speed: 0.008 + Math.random() * 0.012,
      hue: Math.random() > 0.5 ? 1 : 0,
    });
  }

  function burst(x: number, y: number) {
    rings.push({ x, y, t: 0 });
    let nearest = nodes[0];
    let best = Number.POSITIVE_INFINITY;
    for (const n of nodes) {
      const d = (n.x - x) ** 2 + (n.y - y) ** 2;
      if (d < best) {
        best = d;
        nearest = n;
      }
    }
    for (const b of neighbours(nearest))
      packets.push({ a: nearest, b, t: 0, speed: 0.025, hue: 0 });
    // Push nodes away from the click.
    for (const n of nodes) {
      const dx = n.x - x;
      const dy = n.y - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 220) {
        n.vx += (dx / d) * (220 - d) * 0.012;
        n.vy += (dy / d) * (220 - d) * 0.012;
      }
    }
  }

  function draw(time: number) {
    if (++frame % 90 === 0) colours = readColours();
    ctx!.clearRect(0, 0, w, h);

    // Move
    for (const n of nodes) {
      if (pointer.active) {
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 200 * 200) {
          n.vx += dx * 0.00004;
          n.vy += dy * 0.00004;
        }
      }
      n.vx *= 0.985;
      n.vy *= 0.985;
      // keep a minimum drift so the graph never freezes
      if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.04;
      if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.04;
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
    }

    // Edges
    ctx!.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d2 > link * link) continue;
        ctx!.globalAlpha = (1 - Math.sqrt(d2) / link) * 0.28;
        ctx!.strokeStyle = colours.line;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }
      if (pointer.active) {
        const d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (d < 190) {
          ctx!.globalAlpha = (1 - d / 190) * 0.7;
          ctx!.strokeStyle = colours.cyan;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(pointer.x, pointer.y);
          ctx!.stroke();
        }
      }
    }

    // Nodes
    for (const n of nodes) {
      const near =
        pointer.active && Math.hypot(n.x - pointer.x, n.y - pointer.y) < 190;
      ctx!.globalAlpha = near ? 1 : 0.55;
      ctx!.fillStyle = near ? colours.accent : colours.line;
      ctx!.beginPath();
      ctx!.arc(n.x, n.y, near ? n.r + 1 : n.r, 0, Math.PI * 2);
      ctx!.fill();
    }

    // Packets
    if (time - lastSpawn > (small() ? 0.35 : 0.18) && packets.length < 40) {
      lastSpawn = time;
      spawnPacket();
    }
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.speed;
      if (p.t >= 1) {
        packets.splice(i, 1);
        continue;
      }
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      const c = p.hue ? colours.cyan : colours.accent;
      ctx!.globalAlpha = Math.sin(p.t * Math.PI);
      ctx!.fillStyle = c;
      ctx!.shadowColor = c;
      ctx!.shadowBlur = 10;
      ctx!.beginPath();
      ctx!.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.shadowBlur = 0;
    }

    // Ripple rings
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.t += 0.02;
      if (r.t >= 1) {
        rings.splice(i, 1);
        continue;
      }
      ctx!.globalAlpha = 1 - r.t;
      ctx!.strokeStyle = colours.accent;
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.arc(r.x, r.y, r.t * 220, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.lineWidth = 1;
    }
    ctx!.globalAlpha = 1;
  }

  resize();
  tickWhileVisible(canvas, draw);

  const host = canvas.parentElement ?? canvas;
  const local = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  on(host, "pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    Object.assign(pointer, local(e), { active: true });
  });
  on(host, "pointerleave", () => {
    pointer.active = false;
  });
  on(host, "pointerdown", (e) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    const p = local(e);
    burst(p.x, p.y);
  });

  let rt = 0;
  let lastW = window.innerWidth;
  on(window, "resize", () => {
    // Mobile browsers fire resize when the URL bar hides; only rebuild on width changes.
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(rt);
    rt = window.setTimeout(resize, 150);
  });
  onCleanup(() => clearTimeout(rt));

  // Fade the canvas in.
  gsap.fromTo(
    canvas,
    { opacity: 0 },
    { opacity: 1, duration: 2, ease: "power2.out" },
  );
}
