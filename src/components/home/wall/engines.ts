import Matter from "matter-js";
import type { HeroMode } from "@/lib/slots";

/**
 * Each hero mode is an "engine": it takes over the same set of polaroid elements,
 * drives their transforms every frame, and returns a cleanup function.
 */
export type EngineCtx = {
  root: HTMLElement;
  cards: HTMLElement[];
  width: number;
  height: number;
  cardW: number;
  cardH: number;
  seed: number;
  mobile: boolean;
  /** vertical band the wall may use (px) */
  top: number;
  bottom: number;
};
export type Engine = (ctx: EngineCtx) => () => void;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gridShape(n: number, mobile: boolean) {
  const rows = mobile ? Math.ceil(n / 3) : n > 12 ? 3 : 2;
  return { rows, cols: Math.ceil(n / rows) };
}

/** Moodboard-style jittered grid of card centres. */
export function layout(ctx: EngineCtx, seedOffset = 0) {
  const { cards, width, cardW, cardH, mobile, top, bottom } = ctx;
  const r = rng(ctx.seed + seedOffset);
  const n = cards.length;
  const { rows, cols } = gridShape(n, mobile);
  const padX = width * (mobile ? 0.03 : 0.05);
  const cellW = (width - padX * 2) / cols;
  const cellH = (bottom - top) / rows;
  const span = Math.max(bottom - top - cardH, 0);
  // shuffle which card goes to which cell
  const order = cards.map((_, i) => i).sort(() => r() - 0.5);
  return order.map((cell, i) => {
    const row = Math.floor(cell / cols);
    const col = cell % cols;
    // top edges run from `top` (first row) to `bottom - cardH` (last row) so no card spills out of the band
    const base = top + span * (rows === 1 ? 0.5 : row / (rows - 1));
    const stagger = (col % 2 ? 0.06 : -0.03) * cellH + (r() - 0.5) * cellH * 0.1;
    return {
      index: i,
      x: padX + cellW * (col + 0.5) + (r() - 0.5) * cellW * 0.28,
      y: Math.min(Math.max(base + stagger, top - 10), bottom - cardH),
      rot: (r() - 0.5) * 12,
      depth: 0.55 + r() * 0.75,
      phase: r() * Math.PI * 2,
      pin: ["#c3362b", "#b08d57", "#1b1b1b", "#f1eee8", "#c3362b", "#8a8a8a"][Math.floor(r() * 6)],
      cardW,
    };
  });
}

type Pointer = { x: number; y: number; vx: number; vy: number; inside: boolean };

function trackPointer(root: HTMLElement) {
  const p: Pointer = { x: -9999, y: -9999, vx: 0, vy: 0, inside: false };
  let lastT = performance.now();
  const onMove = (e: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    const now = performance.now();
    const dt = Math.max(now - lastT, 1) / 1000;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (p.x > -9000) {
      p.vx = p.vx * 0.5 + ((x - p.x) / dt) * 0.5;
      p.vy = p.vy * 0.5 + ((y - p.y) / dt) * 0.5;
    }
    p.x = x;
    p.y = y;
    p.inside = y >= 0 && y <= rect.height;
    lastT = now;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return { p, stop: () => window.removeEventListener("pointermove", onMove) };
}

function loop(fn: (dt: number, t: number) => void) {
  let raf = 0;
  let last = performance.now();
  const tick = (now: number) => {
    // allow long frames (Low Power Mode, older phones) so the motion keeps real-time speed
    const dt = Math.min((now - last) / 1000, 1 / 15);
    last = now;
    fn(dt, now / 1000);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

function local(root: HTMLElement, e: PointerEvent) {
  const rect = root.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);

function resetCard(el: HTMLElement, pinColor: string, w: number) {
  el.style.transformOrigin = "";
  el.style.opacity = "1";
  el.style.filter = "";
  el.style.zIndex = "";
  el.style.setProperty("--w", `${w}px`);
  el.style.setProperty("--pin-color", pinColor);
  el.classList.remove("unpinned");
}

// ---------------------------------------------------------------------------
// PINBOARD — pendulum physics hanging from a pin; drag to move, dbl-click to unpin
// ---------------------------------------------------------------------------
const pinboard: Engine = (ctx) => {
  const { root, cards, cardW, cardH, height } = ctx;
  const spots = layout(ctx);
  const { p, stop: stopPointer } = trackPointer(root);
  let zTop = 10;
  // the floor sits above the tagline/buttons band so a fallen card can always be picked up again
  const floor = () => Math.min(height - cardH - 6, ctx.bottom - cardH * 0.8);
  /** a fallen card re-pins only if it's carried at least this far above the floor */
  const repinLift = cardH * 0.6;

  type Card = {
    el: HTMLElement;
    px: number;
    py: number;
    angle: number;
    rest: number;
    av: number;
    pinned: boolean;
    vx: number;
    vy: number;
    intro: number;
    drag: null | { ox: number; oy: number; lastX: number; lastY: number; lastT: number; moved: number; id: number };
    lastTap: number;
  };

  const state: Card[] = cards.map((el, i) => {
    const s = spots[i];
    resetCard(el, s.pin, cardW);
    el.style.zIndex = String(i + 1);
    const rest = ((s.rot * Math.PI) / 180) * 0.6;
    return { el, px: s.x, py: s.y, angle: rest, rest, av: 0, pinned: true, vx: 0, vy: 0, intro: -i * 0.07, drag: null, lastTap: 0 };
  });
  const byEl = new Map(state.map((s) => [s.el, s]));

  const popPin = (s: Card) =>
    s.el.querySelector(".pin")?.animate([{ scale: 1.8 }, { scale: 1 }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });

  const unpin = (s: Card) => {
    if (!s.pinned) return;
    s.pinned = false;
    s.drag = null;
    s.vx = (Math.random() - 0.5) * 220;
    s.vy = -160;
    s.el.classList.add("unpinned");
    s.el.dataset.cursor = "pick up";
  };
  const repin = (s: Card) => {
    s.pinned = true;
    s.vx = s.vy = 0;
    s.av = 0;
    s.rest = (Math.random() - 0.5) * 0.12;
    s.el.classList.remove("unpinned");
    s.el.dataset.cursor = "drag";
    popPin(s);
  };

  const down = (e: PointerEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".polaroid");
    const s = el && byEl.get(el);
    if (!s) return;
    e.preventDefault();
    const pt = local(root, e);
    s.drag = { ox: pt.x - s.px, oy: pt.y - s.py, lastX: pt.x, lastY: pt.y, lastT: performance.now(), moved: 0, id: e.pointerId };
    s.vx = s.vy = 0;
    el.setPointerCapture(e.pointerId);
    el.style.zIndex = String(++zTop);
  };
  const move = (e: PointerEvent) => {
    for (const s of state) {
      const d = s.drag;
      if (!d || d.id !== e.pointerId) continue;
      const pt = local(root, e);
      const now = performance.now();
      const dt = Math.max(now - d.lastT, 1) / 1000;
      const dx = pt.x - d.lastX;
      const dy = pt.y - d.lastY;
      d.moved += Math.hypot(dx, dy);
      s.vx = s.vx * 0.5 + (dx / dt) * 0.5; // remembered so a dropped card is thrown, not dropped dead
      s.vy = s.vy * 0.5 + (dy / dt) * 0.5;
      d.lastX = pt.x;
      d.lastY = pt.y;
      d.lastT = now;
      s.px = pt.x - d.ox;
      s.py = Math.min(Math.max(pt.y - d.oy, -cardH * 0.3), floor());
      if (s.pinned) s.av -= dx * 0.02; // swing opposite to the direction of travel
    }
  };
  const up = (e: PointerEvent) => {
    for (const s of state) {
      const d = s.drag;
      if (!d || d.id !== e.pointerId) continue;
      s.drag = null;
      const now = performance.now();
      if (d.moved < 6) {
        // a tap: two quick taps on a pinned card unpin it (works for mouse and touch alike)
        if (s.pinned && now - s.lastTap < 350) {
          s.lastTap = 0;
          unpin(s);
        } else {
          s.lastTap = now;
          if (s.pinned) popPin(s);
        }
        continue;
      }
      s.lastTap = 0;
      if (s.pinned) {
        s.rest = (Math.random() - 0.5) * 0.12;
        popPin(s);
      } else if (s.py < floor() - repinLift) {
        repin(s); // carried back up the board: pin it where it was let go
      } else {
        s.vx = Math.max(Math.min(s.vx, 900), -900); // still low: let it fall again
        s.vy = Math.min(s.vy, 0);
      }
    }
  };

  root.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);

  const stopLoop = loop((dt) => {
    const fl = floor();
    for (const s of state) {
      s.intro = Math.min(s.intro + dt * 1.1, 1);
      if (!s.pinned) {
        if (s.drag) {
          // carried: hang level-ish from the fingers
          s.angle += (s.vx * 0.0006 - s.angle) * Math.min(dt * 8, 1);
        } else {
          s.vy += 2600 * dt;
          s.px += s.vx * dt;
          s.py += s.vy * dt;
          s.angle += (s.vx * 0.002 - s.angle * 0.5) * dt * 4;
          s.px = Math.min(Math.max(s.px, cardW / 2), ctx.width - cardW / 2);
          if (s.py > fl) {
            s.py = fl;
            s.vy *= -0.25;
            s.vx *= 0.8;
            if (Math.abs(s.vy) < 40) s.vy = 0;
          }
        }
      } else {
        // damped pendulum around its resting angle
        const k = 26;
        const damping = s.drag ? 4 : 1.3;
        let torque = -k * (s.angle - s.rest) - damping * s.av;
        // breeze from a moving cursor
        const dist = Math.hypot(p.x - s.px, p.y - (s.py + cardH / 2));
        const reach = cardW * 1.4;
        if (!s.drag && dist < reach) {
          const f = 1 - dist / reach;
          torque += p.vx * 0.022 * f * f;
        }
        s.av += torque * dt;
        s.av = Math.max(Math.min(s.av, 8), -8);
        s.angle += s.av * dt;
        s.angle = Math.max(Math.min(s.angle, 1.1), -1.1);
      }
      const drop = (1 - easeOut(s.intro)) * -(height * 0.9);
      const scale = s.drag ? 1.06 : 1;
      // pinned cards swing from the pin; loose cards turn about their centre
      s.el.style.transformOrigin = s.pinned ? "" : "50% 50%";
      s.el.style.transform = `translate3d(${s.px - cardW / 2}px, ${s.py + drop}px, 0) rotate(${s.angle}rad) scale(${scale})`;
      s.el.style.opacity = s.intro <= 0 ? "0" : "1";
    }
    p.vx *= 0.9;
  });

  return () => {
    stopLoop();
    stopPointer();
    root.removeEventListener("pointerdown", down);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
  };
};

// ---------------------------------------------------------------------------
// SCATTER — layered parallax depth; cards drift away from the cursor
// ---------------------------------------------------------------------------
const scatter: Engine = (ctx) => {
  const { root, cards, cardW, cardH, width, height } = ctx;
  const spots = layout(ctx, 7);
  const { p, stop: stopPointer } = trackPointer(root);
  const cur = spots.map((s) => ({ x: s.x, y: s.y, rot: s.rot, intro: 0 }));

  cards.forEach((el, i) => {
    const s = spots[i];
    resetCard(el, s.pin, cardW);
    el.style.zIndex = String(Math.round(s.depth * 100));
  });

  const stopLoop = loop((dt, t) => {
    const nx = p.inside ? p.x / width - 0.5 : 0;
    const ny = p.inside ? p.y / height - 0.5 : 0;
    cards.forEach((el, i) => {
      const s = spots[i];
      const c = cur[i];
      c.intro = Math.min(c.intro + dt * 0.9, 1);
      if (c.intro < i * 0.04) return;
      const k = easeOut((c.intro - i * 0.04) / (1 - i * 0.04));
      let tx = s.x - nx * 70 * s.depth + Math.sin(t * 0.5 + s.phase) * 10 * s.depth;
      let ty = s.y - ny * 50 * s.depth + Math.cos(t * 0.4 + s.phase) * 8 * s.depth;
      const cx = tx;
      const cy = ty + cardH / 2;
      const dx = cx - p.x;
      const dy = cy - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = cardW * 1.6;
      if (p.inside && dist < reach) {
        const f = Math.pow(1 - dist / reach, 2) * 140;
        tx += (dx / dist) * f;
        ty += (dy / dist) * f;
      }
      c.x += (tx - c.x) * Math.min(dt * 6, 1);
      c.y += (ty - c.y) * Math.min(dt * 6, 1);
      c.rot += (s.rot + nx * 10 * s.depth - c.rot) * Math.min(dt * 4, 1);
      const ox = width / 2;
      const oy = height / 2 - cardH / 2;
      const x = ox + (c.x - ox) * k;
      const y = oy + (c.y - oy) * k;
      const scale = (0.7 + s.depth * 0.32) * (0.4 + 0.6 * k);
      el.style.transform = `translate3d(${x - cardW / 2}px, ${y}px, 0) rotate(${c.rot}deg) scale(${scale})`;
      el.style.opacity = String(Math.min(1, k * 1.5));
      el.style.filter = s.depth < 0.75 ? `brightness(${0.9 + s.depth * 0.1})` : "";
    });
  });

  return () => {
    stopLoop();
    stopPointer();
  };
};

// ---------------------------------------------------------------------------
// ORBIT — 3D carousel; drag to spin, click to bring a card forward
// ---------------------------------------------------------------------------
const orbit: Engine = (ctx) => {
  const { root, cards, width, top, bottom, mobile } = ctx;
  const n = cards.length;
  const w = Math.min(ctx.cardW * (mobile ? 1.05 : 0.95), 220);
  const h = w * (ctx.cardH / ctx.cardW);
  const step = (Math.PI * 2) / n;
  const radius = Math.max((n * w) / (Math.PI * 2) * 1.15, mobile ? width * 0.55 : width * 0.3);
  const { p, stop: stopPointer } = trackPointer(root);
  let angle = 0;
  let vel = 0.18;
  let target: number | null = null;
  let focus = -1;
  let drag: null | { x: number; moved: number; id: number } = null;
  let intro = 0;
  const saved = root.style.perspective;
  root.style.perspective = mobile ? "900px" : "1600px";

  cards.forEach((el) => {
    resetCard(el, "#b08d57", w);
    el.style.transformOrigin = "50% 50%";
  });

  const down = (e: PointerEvent) => {
    if (!(e.target as HTMLElement).closest(".polaroid") && !(e.target as HTMLElement).closest("[data-wall]")) return;
    drag = { x: e.clientX, moved: 0, id: e.pointerId };
    target = null;
  };
  const move = (e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    drag.x = e.clientX;
    drag.moved += Math.abs(dx);
    angle += dx * 0.005;
    vel = dx * 0.3;
  };
  const up = (e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return;
    const wasClick = drag.moved < 6;
    drag = null;
    if (wasClick) {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".polaroid");
      const i = el ? cards.indexOf(el) : -1;
      if (i >= 0) {
        focus = focus === i ? -1 : i;
        // shortest rotation so card i faces front
        const want = -i * step;
        const diff = Math.atan2(Math.sin(want - angle), Math.cos(want - angle));
        target = angle + diff;
      }
    }
  };
  root.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);

  const cx = width / 2;
  const cy = top + (bottom - top) / 2;
  const stopLoop = loop((dt) => {
    intro = Math.min(intro + dt * 0.7, 1);
    if (target !== null) {
      angle += (target - angle) * Math.min(dt * 5, 1);
      vel = 0;
      if (Math.abs(target - angle) < 0.001) target = null;
    } else if (!drag) {
      angle += vel * dt;
      vel += ((focus >= 0 ? 0 : 0.15) - vel) * Math.min(dt * 1.5, 1);
    }
    const tilt = p.inside ? (p.y / ctx.height - 0.5) * -14 : -4;
    const k = easeOut(intro);
    cards.forEach((el, i) => {
      const theta = angle + i * step;
      const facing = Math.cos(theta);
      const isFocus = i === focus;
      const r = radius * (0.4 + 0.6 * k);
      const scale = (isFocus ? 1.25 : 1) * (0.6 + 0.4 * k);
      el.style.transform =
        `translate3d(${cx - w / 2}px, ${cy - h / 2}px, 0) rotateX(${tilt}deg) rotateY(${theta}rad) translateZ(${r}px) scale(${scale})`;
      el.style.zIndex = String(Math.round((facing + 1) * 100));
      el.style.opacity = String((0.35 + 0.65 * ((facing + 1) / 2)) * k);
      el.style.filter = facing < 0 ? `brightness(${0.75 + facing * 0.15})` : "";
    });
  });

  return () => {
    stopLoop();
    stopPointer();
    root.style.perspective = saved;
    root.removeEventListener("pointerdown", down);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
};

// ---------------------------------------------------------------------------
// GRAVITY — matter-js; cards tumble in, pile up, and can be flung
// ---------------------------------------------------------------------------
const gravity: Engine = (ctx) => {
  const { root, cards, width, cardW, cardH } = ctx;
  // desktop: the floor sits just above the copy band so the pile never hides the CTAs;
  // phones: the copy is up under the masthead, so the pile lands on the bottom edge
  const height = ctx.mobile ? ctx.bottom : ctx.bottom + cardH * 0.15;
  const w = cardW * 0.9;
  const h = cardH * 0.9;
  const { Engine: MEngine, Bodies, Composite, Body, Constraint } = Matter;
  const engine = MEngine.create({ gravity: { x: 0, y: 1.1 } });
  const wallOpts = { isStatic: true, restitution: 0.2, friction: 0.6 };
  const thick = 400;
  Composite.add(engine.world, [
    Bodies.rectangle(width / 2, height + thick / 2, width * 3, thick, wallOpts),
    Bodies.rectangle(-thick / 2, height / 2 - height, thick, height * 4, wallOpts),
    Bodies.rectangle(width + thick / 2, height / 2 - height, thick, height * 4, wallOpts),
  ]);
  const r = rng(ctx.seed + 3);
  const bodies = cards.map((el, i) => {
    resetCard(el, "#c3362b", w);
    el.classList.add("unpinned");
    el.style.transformOrigin = "50% 50%";
    const b = Bodies.rectangle(w / 2 + r() * (width - w), -h - i * (h * 0.55), w, h, {
      angle: (r() - 0.5) * 1.2,
      restitution: 0.35,
      friction: 0.5,
      frictionAir: 0.012,
      chamfer: { radius: 3 },
      density: 0.002,
    });
    return b;
  });
  Composite.add(engine.world, bodies);
  const { p, stop: stopPointer } = trackPointer(root);

  let grab: null | { c: Matter.Constraint; id: number } = null;
  const down = (e: PointerEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".polaroid");
    const i = el ? cards.indexOf(el) : -1;
    if (i < 0) return;
    e.preventDefault();
    const pt = local(root, e);
    const b = bodies[i];
    const off = { x: pt.x - b.position.x, y: pt.y - b.position.y };
    const cos = Math.cos(-b.angle);
    const sin = Math.sin(-b.angle);
    const c = Constraint.create({
      pointA: pt,
      bodyB: b,
      pointB: { x: off.x * cos - off.y * sin, y: off.x * sin + off.y * cos },
      stiffness: 0.12,
      damping: 0.08,
      length: 0,
    });
    Composite.add(engine.world, c);
    grab = { c, id: e.pointerId };
    el!.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (grab && grab.id === e.pointerId) grab.c.pointA = local(root, e);
  };
  const up = (e: PointerEvent) => {
    if (grab && grab.id === e.pointerId) {
      Composite.remove(engine.world, grab.c);
      grab = null;
    }
  };
  root.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);

  let acc = 0;
  const stopLoop = loop((dt) => {
    // a fast-moving cursor gusts nearby cards
    const speed = Math.hypot(p.vx, p.vy);
    if (!grab && speed > 600) {
      for (const b of bodies) {
        const d = Math.hypot(b.position.x - p.x, b.position.y - p.y);
        if (d < w * 1.2) {
          Body.applyForce(b, b.position, { x: p.vx * 0.0000035 * b.mass, y: (p.vy * 0.0000035 - 0.0004) * b.mass });
        }
      }
    }
    p.vx *= 0.85;
    p.vy *= 0.85;
    acc += dt;
    while (acc > 1 / 120) {
      MEngine.update(engine, 1000 / 120);
      acc -= 1 / 120;
    }
    bodies.forEach((b, i) => {
      if (b.position.y > height + 500) Body.setPosition(b, { x: width / 2, y: -h });
      cards[i].style.transform = `translate3d(${b.position.x - w / 2}px, ${b.position.y - h / 2}px, 0) rotate(${b.angle}rad)`;
    });
  });

  return () => {
    stopLoop();
    stopPointer();
    root.removeEventListener("pointerdown", down);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
    Composite.clear(engine.world, false);
    MEngine.clear(engine);
  };
};

/** Static fallback for reduced-motion visitors. */
export const staticLayout: Engine = (ctx) => {
  layout(ctx).forEach((s, i) => {
    const el = ctx.cards[i];
    resetCard(el, s.pin, ctx.cardW);
    el.style.transform = `translate3d(${s.x - ctx.cardW / 2}px, ${s.y}px, 0) rotate(${s.rot * 0.6}deg)`;
  });
  return () => {};
};

export const ENGINES: Record<HeroMode, Engine> = { pinboard, scatter, orbit, gravity };
