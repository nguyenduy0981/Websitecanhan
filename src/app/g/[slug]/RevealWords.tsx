import styles from "./OpeningSequence.module.css";

const MAX_STAGGERED_WORDS = 60;
const DELAY_PER_WORD_MS = 30;

/**
 * Splits text into words, each in its own span with an incremental
 * animation-delay, so the message seems to softly write itself in once
 * the gift is opened (see OpeningSequence.module.css — the animation is
 * `animation-play-state: paused` until the opening checkbox is checked,
 * so this needs no client JS at all). Still just plain text children —
 * React escapes every word the same as any other JSX text, so this
 * doesn't weaken the "never dangerouslySetInnerHTML" XSS rule.
 * Long messages are capped at MAX_STAGGERED_WORDS distinct delays so a
 * very long message (schema allows up to 10,000 chars) never turns into
 * an absurdly long reveal — everything past the cap appears together
 * with the last staggered word.
 */
export function RevealWords({ text }: { text: string }) {
  const words = text.split(/(\s+)/); // keep whitespace tokens so spacing/line breaks survive

  let wordIndex = 0;
  return (
    <>
      {words.map((token, i) => {
        if (!token.trim()) {
          return token; // whitespace/newline — render as-is, no span needed
        }
        const delay = Math.min(wordIndex, MAX_STAGGERED_WORDS) * DELAY_PER_WORD_MS;
        wordIndex += 1;
        return (
          <span key={i} className={styles.word} style={{ animationDelay: `${delay}ms` }}>
            {token}
          </span>
        );
      })}
    </>
  );
}
