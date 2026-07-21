import { cn } from "@/vo-tri/lib/cn";

/**
 * The base "circle with an image or an initial fallback" every avatar in
 * the product is built from — comments, feed items, the header, the
 * leaderboard. `ProfileAvatar` wraps this with the extra ring/online-dot
 * decoration Profile needs; everywhere else uses this directly.
 */
export function Avatar({
  name,
  avatarUrl,
  size = 36,
  className,
}: {
  name: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-vt-full bg-vt-surface font-semibold text-vt-text-primary",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}
