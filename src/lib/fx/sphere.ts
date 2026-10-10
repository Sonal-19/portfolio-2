import { $, $$, finePointer, on, tickWhileVisible } from "./core";

/**
 * 3D tag sphere built from plain DOM spans. Points sit on a Fibonacci sphere;
 * hover steers it (desktop), drag/flick throws it (mouse and touch), and it
 * always drifts back toward a gentle idle spin.
 */
export function tagSphere() {
  const root = $("[data-sphere]");
  if (!root) return;
  const items = $$("[data-sphere-item]", root);
  const n = items.length;
  // Walk the Fibonacci points with a co-prime stride so neighbours in the DOM
  // (e.g. all highlighted skills) end up scattered around the sphere.
  let stride = Math.max(1, Math.round(n * 0.38));
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  while (gcd(stride, n) !== 1) stride++;
  const pts = items.map((_, k) => {
    const i = (k * stride) % n;
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(phi) * r, y, z: Math.sin(phi) * r };
  });

  let R = root.clientWidth * 0.4;
  const idle = { x: 0.0025, y: 0.004 };
  const vel = { x: idle.x, y: idle.y };
  let target = { ...idle };
  let dragging = false;
  let last = { x: 0, y: 0 };

  const rotate = (ax: number, ay: number) => {
    const cx = Math.cos(ax);
    const sx = Math.sin(ax);
    const cy = Math.cos(ay);
    const sy = Math.sin(ay);
    for (const p of pts) {
      // around X
      const y1 = p.y * cx - p.z * sx;
      const z1 = p.y * sx + p.z * cx;
      // around Y
      const x2 = p.x * cy + z1 * sy;
      const z2 = -p.x * sy + z1 * cy;
      p.x = x2;
      p.y = y1;
      p.z = z2;
    }
  };

  const render = () => {
    const depth = 2.4;
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const s = depth / (depth - p.z);
      const el = items[i];
      el.style.transform = `translate(-50%, -50%) translate3d(${p.x * R * s}px, ${p.y * R * s}px, 0) scale(${s * 0.85})`;
      el.style.opacity = String(0.18 + ((p.z + 1) / 2) * 0.82);
      el.style.zIndex = String(Math.round((p.z + 1) * 100));
      el.style.filter = p.z < -0.35 ? `blur(${(-p.z - 0.35) * 2.5}px)` : "";
    }
  };

  tickWhileVisible(root, () => {
    if (!dragging) {
      vel.x += (target.x - vel.x) * 0.04;
      vel.y += (target.y - vel.y) * 0.04;
    }
    rotate(vel.x, vel.y);
    render();
  });
  render();

  on(window, "resize", () => {
    R = root.clientWidth * 0.4;
  });

  if (finePointer()) {
    on(root, "pointermove", (e) => {
      if (dragging) return;
      const r = root.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      target = { x: -dy * 0.03, y: dx * 0.03 };
    });
    on(root, "pointerleave", () => {
      target = { ...idle };
    });
  }

  on(root, "pointerdown", (e) => {
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
    root.setPointerCapture(e.pointerId);
  });
  on(root, "pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };
    vel.y = dx * 0.006;
    vel.x = -dy * 0.006;
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    // keep the throw for a moment, then ease back to idle via `target`
    target = { ...idle };
  };
  on(root, "pointerup", release);
  on(root, "pointercancel", release);
}
