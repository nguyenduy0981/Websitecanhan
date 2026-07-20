import { cn } from "@/vo-tri/lib/cn";

/**
 * The mascot is VÔ TRI's "linh hồn" (soul) — the one element meant to
 * recur everywhere (empty states, loading, toasts, onboarding, 404s,
 * celebrations) so the brand has a face, not just a palette.
 *
 * This is a deliberately simple geometric-blob placeholder, not final
 * illustration — but the *architecture* is the real deliverable: every
 * call site renders `<Mascot mood="..." />` against this fixed mood
 * vocabulary, so swapping the placeholder for real illustration/Lottie
 * assets later is a change to MOOD_FACES below only, never to callers.
 */
export type MascotMood =
  | "idle"
  | "happy"
  | "laughing"
  | "thinking"
  | "sleepy"
  | "mindblown"
  | "celebrating";

export type MascotSize = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<MascotSize, number> = {
  sm: 32,
  md: 56,
  lg: 96,
  xl: 160,
};

interface MascotFace {
  eyes: React.ReactNode;
  mouth: React.ReactNode;
  extras?: React.ReactNode;
  /** Whole-character rotation for moods that read as "tilted" (thinking). */
  tilt?: number;
}

// Body is a fixed 100x100 viewBox blob; every face is composed of simple
// primitives positioned within it, so new moods stay cheap to add.
const MOOD_FACES: Record<MascotMood, MascotFace> = {
  idle: {
    eyes: (
      <>
        <circle cx="38" cy="46" r="4.5" fill="currentColor" />
        <circle cx="62" cy="46" r="4.5" fill="currentColor" />
      </>
    ),
    mouth: <path d="M42 60 Q50 66 58 60" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />,
  },
  happy: {
    eyes: (
      <>
        <path d="M33 47 Q38 41 43 47" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M57 47 Q62 41 67 47" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </>
    ),
    mouth: (
      <path d="M40 58 Q50 70 60 58 Q50 64 40 58 Z" fill="currentColor" />
    ),
  },
  laughing: {
    eyes: (
      <>
        <path d="M32 46 Q38 40 44 46" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M56 46 Q62 40 68 46" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </>
    ),
    mouth: <ellipse cx="50" cy="61" rx="11" ry="8" fill="currentColor" />,
    extras: (
      <>
        <line x1="20" y1="50" x2="27" y2="48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <line x1="80" y1="50" x2="73" y2="48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </>
    ),
  },
  thinking: {
    eyes: (
      <>
        <circle cx="38" cy="47" r="4" fill="currentColor" />
        <circle cx="62" cy="47" r="4" fill="currentColor" />
        <path d="M55 38 Q63 33 69 37" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    ),
    mouth: <path d="M43 61 Q50 58 57 61" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />,
    tilt: -8,
  },
  sleepy: {
    eyes: (
      <>
        <line x1="33" y1="47" x2="43" y2="47" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="57" y1="47" x2="67" y2="47" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      </>
    ),
    mouth: <circle cx="50" cy="61" r="3" fill="currentColor" />,
    extras: (
      <text x="70" y="28" fontSize="14" fill="currentColor" opacity="0.6" fontWeight="700">
        z
      </text>
    ),
  },
  mindblown: {
    eyes: (
      <>
        <circle cx="38" cy="47" r="6.5" fill="currentColor" />
        <circle cx="62" cy="47" r="6.5" fill="currentColor" />
      </>
    ),
    mouth: <circle cx="50" cy="63" r="5" fill="currentColor" />,
    extras: (
      <>
        <path d="M12 30 L18 34 M88 30 L82 34 M50 6 L50 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </>
    ),
  },
  celebrating: {
    eyes: (
      <>
        <path d="M33 47 Q38 41 43 47" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M57 47 Q62 41 67 47" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </>
    ),
    mouth: <path d="M39 57 Q50 72 61 57 Q50 65 39 57 Z" fill="currentColor" />,
    extras: (
      <>
        <path d="M14 20 L17 26 L23 27 L18 31 L20 37 L14 33 L8 37 L10 31 L5 27 L11 26 Z" fill="currentColor" opacity="0.7" />
        <path d="M86 20 L89 26 L95 27 L90 31 L92 37 L86 33 L80 37 L82 31 L77 27 L83 26 Z" fill="currentColor" opacity="0.7" />
      </>
    ),
  },
};

export function Mascot({
  mood = "idle",
  size = "md",
  animate = true,
  className,
}: {
  mood?: MascotMood;
  size?: MascotSize;
  /** Ambient idle float — set false inside places that already animate their own entrance (e.g. a bounce-in toast). */
  animate?: boolean;
  className?: string;
}) {
  const face = MOOD_FACES[mood];
  const px = SIZE_PX[size];

  return (
    <svg
      role="img"
      aria-label={`Mascot VÔ TRI — ${mood}`}
      width={px}
      height={px}
      viewBox="0 0 100 100"
      className={cn("text-vt-on-accent shadow-vt-glow-primary rounded-vt-full", animate && "vt-float", className)}
      style={face.tilt ? { transform: `rotate(${face.tilt}deg)` } : undefined}
    >
      <defs>
        <linearGradient id="vt-mascot-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(var(--vt-primary))" />
          <stop offset="100%" stopColor="rgb(var(--vt-secondary))" />
        </linearGradient>
      </defs>
      {/* antenna */}
      <line x1="50" y1="6" x2="50" y2="18" stroke="url(#vt-mascot-body)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="5" r="4" fill="url(#vt-mascot-body)" />
      {/* body — a slightly squashed blob, not a perfect circle */}
      <ellipse cx="50" cy="55" rx="42" ry="38" fill="url(#vt-mascot-body)" />
      {face.eyes}
      {face.mouth}
      {face.extras}
    </svg>
  );
}
