import type { ReactNode } from "react";
import styles from "./OpeningSequence.module.css";

export const OPEN_TOGGLE_ID = "lovebox-open-gate";

// 12 burst particles scattering outward in a rough circle — pure CSS,
// deterministic (no client JS/hydration needed for the math).
const BURST_PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const distance = 120 + (i % 3) * 40;
  const tx = Math.round(Math.cos(angle) * distance);
  const ty = Math.round(Math.sin(angle) * distance);
  const symbol = i % 2 === 0 ? "✨" : "💖";
  return { id: i, tx, ty, symbol, delay: (i % 4) * 40 };
});

/**
 * The gift-opening moment: a breathing closed box → tap → burst (light
 * flash, lid halves, particle scatter) → the actual gift content
 * (passed as `children`) reveals. Implemented as a pure CSS "checkbox
 * hack" (see OpeningSequence.module.css) so the core interaction needs
 * no client JS/hydration at all — this stays a Server Component.
 */
export function OpeningSequence({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <input
        type="checkbox"
        id={OPEN_TOGGLE_ID}
        className={styles.toggle}
        aria-label="Mở hộp quà"
      />

      <label htmlFor={OPEN_TOGGLE_ID} className={styles.closedBox}>
        <span className={styles.boxEmoji} aria-hidden="true">
          🎁
        </span>
        <span className={styles.tapHint}>Chạm để mở quà</span>
      </label>

      <div className={styles.burst} aria-hidden="true">
        <span className={styles.flash} />
        <span className={styles.ring} />
        <span className={`${styles.lid} ${styles.lidLeft}`} />
        <span className={`${styles.lid} ${styles.lidRight}`} />
        {BURST_PARTICLES.map((p) => (
          <span
            key={p.id}
            className={styles.burstParticle}
            style={
              {
                "--tx": `${p.tx}px`,
                "--ty": `${p.ty}px`,
                animationDelay: `${p.delay}ms`,
              } as React.CSSProperties
            }
          >
            {p.symbol}
          </span>
        ))}
      </div>

      <div className={styles.content}>{children}</div>
    </div>
  );
}

export { styles as openingSequenceStyles };
