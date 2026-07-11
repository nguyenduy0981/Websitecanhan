// Canvas particle engine for the gift-viewer ambient effects. Deliberately
// a single <canvas> (one paint surface) driven by requestAnimationFrame
// rather than N separate DOM nodes each with their own CSS animation —
// cheaper to recompute per frame and easier to pause/scale reliably. See
// EffectCanvas.tsx for the React wrapper (visibilitychange pause,
// prefers-reduced-motion opt-out, device-adaptive particle count).

export type EffectKind = "hearts" | "confetti" | "snow" | "petals" | "fireflies" | "bubbles";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  phase: number; // for sway/pulse sine waves
  color: string;
}

const CONFETTI_COLORS = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function spawnParticle(kind: EffectKind, width: number, height: number, fresh: boolean): Particle {
  const base: Particle = {
    x: rand(0, width),
    y: fresh ? rand(0, height) : height + 20,
    vx: 0,
    vy: 0,
    size: 14,
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: rand(-0.01, 0.01),
    opacity: rand(0.55, 0.95),
    phase: rand(0, Math.PI * 2),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
  };

  switch (kind) {
    case "hearts":
      return { ...base, y: fresh ? rand(0, height) : height + 20, vy: -rand(0.3, 0.8), size: rand(14, 24) };
    case "confetti":
      return { ...base, y: fresh ? rand(-height, 0) : -20, vy: rand(0.6, 1.4), size: rand(6, 10) };
    case "snow":
      return { ...base, y: fresh ? rand(-height, 0) : -20, vy: rand(0.3, 0.9), size: rand(3, 6), opacity: rand(0.4, 0.85) };
    case "petals":
      return { ...base, y: fresh ? rand(-height, 0) : -20, vy: rand(0.4, 1), size: rand(10, 18) };
    case "fireflies":
      return { ...base, y: rand(0, height), vy: 0, size: rand(3, 5), opacity: rand(0.3, 0.9) };
    case "bubbles":
      return { ...base, y: fresh ? rand(0, height) : height + 20, vy: -rand(0.3, 0.7), size: rand(6, 16), opacity: rand(0.3, 0.6) };
  }
}

/** Draws one particle for the given effect kind at its current state. */
function draw(ctx: CanvasRenderingContext2D, kind: EffectKind, p: Particle): void {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  switch (kind) {
    case "hearts":
      ctx.font = `${p.size}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💖", 0, 0);
      break;
    case "confetti":
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      break;
    case "snow":
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "petals":
      ctx.font = `${p.size}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🌸", 0, 0);
      break;
    case "fireflies":
      ctx.fillStyle = "#fde68a";
      ctx.shadowColor = "#fde68a";
      ctx.shadowBlur = p.size * 2;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "bubbles":
      ctx.strokeStyle = "#bae6fd";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

/** Advances one particle by one frame (dtMs since last frame). */
function step(kind: EffectKind, p: Particle, width: number, height: number, dtMs: number): Particle {
  const dt = dtMs / 16.6667; // normalize to ~60fps steps
  p.phase += 0.02 * dt;
  p.rotation += p.rotationSpeed * dt;

  const sway = Math.sin(p.phase) * (kind === "petals" ? 0.6 : 0.3);

  if (kind === "fireflies") {
    // Gentle wandering instead of a directional fall/rise.
    p.x += Math.cos(p.phase * 0.7) * 0.4 * dt;
    p.y += Math.sin(p.phase) * 0.4 * dt;
    p.opacity = 0.3 + (Math.sin(p.phase * 1.3) + 1) * 0.3;
  } else {
    p.x += (p.vx + sway) * dt;
    p.y += p.vy * dt;
  }

  const offTop = p.y < -30;
  const offBottom = p.y > height + 30;
  const offSide = p.x < -30 || p.x > width + 30;

  if (offTop || offBottom || offSide) {
    return spawnParticle(kind, width, height, false);
  }
  return p;
}

export interface EffectEngineHandle {
  stop(): void;
}

/**
 * Starts the rAF-driven particle loop on `canvas` for the given effect
 * kind and particle count. Returns a handle to stop it (cancels the
 * frame and never schedules another). Caller (EffectCanvas.tsx) is
 * responsible for pausing/resuming on visibilitychange.
 */
export function startEffectEngine(
  canvas: HTMLCanvasElement,
  kind: EffectKind,
  particleCount: number,
): EffectEngineHandle {
  const ctx = canvas.getContext("2d");
  let stopped = false;
  let frameId = 0;
  let lastTime = performance.now();

  if (!ctx) {
    return { stop: () => {} };
  }

  let particles: Particle[] = Array.from({ length: particleCount }, () =>
    spawnParticle(kind, canvas.width, canvas.height, true),
  );

  function frame(now: number) {
    if (stopped) return;
    const dtMs = Math.min(now - lastTime, 50); // clamp huge gaps (e.g. after a pause)
    lastTime = now;

    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.map((p) => {
      const next = step(kind, p, canvas.width, canvas.height, dtMs);
      draw(ctx!, kind, next);
      return next;
    });

    frameId = requestAnimationFrame(frame);
  }

  frameId = requestAnimationFrame(frame);

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(frameId);
    },
  };
}
