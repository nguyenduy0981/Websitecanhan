const PARTICLE_COUNT = 12;

function symbolFor(effectId: string): string {
  return effectId === "hearts" ? "💖" : "🎉";
}

// Purely decorative — aria-hidden and pointer-events-none so it never
// interferes with screen readers or clicks. Deterministic "randomness" (no
// client JS/hydration needed) via simple modular arithmetic on the index.
export function EffectOverlay({ effectId }: { effectId: string }) {
  if (effectId !== "confetti" && effectId !== "hearts") {
    return null;
  }

  const symbol = symbolFor(effectId);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const left = (i * 97) % 100;
        const duration = 6 + (i % 5);
        const delay = (i % 6) * -1.3;
        return (
          <span
            key={i}
            className="lovebox-effect-particle text-2xl"
            style={{ left: `${left}%`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
          >
            {symbol}
          </span>
        );
      })}
    </div>
  );
}
