import { Camera } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";

const SIZE_PX: Record<"md" | "lg" | "xl", number> = { md: 64, lg: 96, xl: 128 };

/**
 * The animated ring is a slowly-rotating conic gradient sitting behind the
 * avatar image, not a static border — reads as "alive" without needing a
 * JS animation loop. Online/offline is architecture-only for now (no
 * presence backend yet): pass `online` once real presence exists.
 */
export function ProfileAvatar({
  name,
  avatarUrl,
  size = "lg",
  online,
  editable,
  onEdit,
}: {
  name: string;
  avatarUrl?: string;
  size?: "md" | "lg" | "xl";
  online?: boolean;
  editable?: boolean;
  onEdit?: () => void;
}) {
  const px = SIZE_PX[size];

  return (
    <div className="group relative inline-flex" style={{ width: px, height: px }}>
      <div
        className="vt-spin-slow absolute -inset-1.5 rounded-vt-full opacity-90"
        style={{ background: "conic-gradient(from 0deg, rgb(var(--vt-primary)), rgb(var(--vt-secondary)), rgb(var(--vt-vip)), rgb(var(--vt-primary)))" }}
        aria-hidden
      />
      <div className="vt-interactive relative flex h-full w-full items-center justify-center overflow-hidden rounded-vt-full border-2 border-vt-bg bg-vt-card shadow-vt-2 group-hover:scale-105">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-vt-display font-bold text-vt-text-primary" style={{ fontSize: px * 0.4 }}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}

        {editable && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Đổi ảnh đại diện"
            className="absolute inset-0 flex items-center justify-center bg-vt-bg/70 opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Camera className="h-5 w-5 text-vt-text-primary" />
          </button>
        )}
      </div>

      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-vt-full border-2 border-vt-bg",
            online ? "bg-vt-success" : "bg-vt-text-secondary",
          )}
          aria-label={online ? "Đang online" : "Đang offline"}
        />
      )}
    </div>
  );
}
