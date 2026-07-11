"use client";

import { useEffect, useRef } from "react";
import { startEffectEngine, type EffectEngineHandle, type EffectKind } from "./effect-engine";
import { OPEN_TOGGLE_ID } from "./OpeningSequence";

const KNOWN_EFFECTS: readonly EffectKind[] = [
  "hearts",
  "confetti",
  "snow",
  "petals",
  "fireflies",
  "bubbles",
];

const BASE_PARTICLE_COUNT = 36;
const MIN_PARTICLE_COUNT = 10;

/** Fewer particles on memory/CPU-constrained devices — never assume a
 * device is capable just because these APIs are unsupported (Safari/
 * Firefox don't expose deviceMemory at all), only scale down on a real
 * signal. */
function particleCountForDevice(): number {
  let count = BASE_PARTICLE_COUNT;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) {
    count *= 0.55;
  }
  if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) {
    count *= 0.75;
  }
  return Math.max(MIN_PARTICLE_COUNT, Math.round(count));
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  const ctx = canvas.getContext("2d");
  ctx?.scale(dpr, dpr);
}

/**
 * Ambient background effect for the gift viewer — canvas + rAF (see
 * effect-engine.ts). Renders nothing at all for prefers-reduced-motion,
 * an unknown effectId, or "none". Only starts once the gift is actually
 * opened (listens for the OpeningSequence checkbox's change event) so no
 * CPU/battery is spent animating a screen the visitor hasn't reached
 * yet — see CLAUDE.md/SPEC.md "graceful degradation" + Core Web Vitals
 * requirements. Pauses via visibilitychange when the tab is backgrounded.
 */
export function EffectCanvas({ effectId }: { effectId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!KNOWN_EFFECTS.includes(effectId as EffectKind)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let handle: EffectEngineHandle | null = null;
    let started = false;

    function start() {
      if (started || !canvas) return;
      started = true;
      resizeCanvas(canvas);
      handle = startEffectEngine(canvas, effectId as EffectKind, particleCountForDevice());
    }

    function handleVisibility() {
      if (document.hidden) {
        handle?.stop();
        handle = null;
      } else if (started) {
        // Re-arm: a fresh engine picks up cleanly rather than trying to
        // resume a stale rAF id.
        if (canvas) {
          resizeCanvas(canvas);
          handle = startEffectEngine(canvas, effectId as EffectKind, particleCountForDevice());
        }
      }
    }

    function handleResize() {
      if (canvas) resizeCanvas(canvas);
    }

    const toggle = document.getElementById(OPEN_TOGGLE_ID) as HTMLInputElement | null;
    if (toggle?.checked) {
      start();
    } else {
      toggle?.addEventListener("change", start, { once: true });
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleResize);

    return () => {
      toggle?.removeEventListener("change", start);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      handle?.stop();
    };
  }, [effectId]);

  if (!KNOWN_EFFECTS.includes(effectId as EffectKind)) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
