/** Drawn success checkmark for celebration moments (publish, payment, save). */
export function Checkmark({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      className={`lb-pop-in text-green-600 ${className ?? ""}`}
      aria-hidden="true"
    >
      <circle className="lb-checkmark-circle" cx="26" cy="26" r="23" />
      <path className="lb-checkmark-check" d="M14 27l7 7 16-16" />
    </svg>
  );
}
