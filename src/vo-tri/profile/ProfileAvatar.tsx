import { Camera } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";
import { Avatar } from "@/vo-tri/ui/Avatar";

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
      <div className="vt-interactive relative h-full w-full group-hover:scale-105">
        <Avatar name={name} avatarUrl={avatarUrl} size={px} className="border-2 border-vt-bg font-vt-display shadow-vt-2" />

        {editable && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Đổi ảnh đại diện"
            className="absolute inset-0 flex items-center justify-center bg-vt-bg/70 opacity-0 transition-opacity duration-vt-fast focus-visible:opacity-100 group-hover:opacity-100"
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
