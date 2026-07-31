import type { ReactNode } from "react";
import { getRank } from "@/vo-tri/profile/ranks";
import { ProfileAvatar } from "@/vo-tri/profile/ProfileAvatar";
import { Badge } from "@/vo-tri/ui/Badge";
import type { UserPreview } from "./types";

/** Quick "who is this" glance — tapping an avatar/name anywhere should be able to surface this without navigating away. Reuses ProfileAvatar/getRank so a person looks identical here and on their real Profile page. */
export function UserPreviewCard({ user, cta }: { user: UserPreview; cta?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-vt-lg border border-vt-border bg-vt-card p-4">
      <ProfileAvatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-vt-text-primary">{user.name}</p>
          <Badge variant="xp">Lv.{user.level}</Badge>
        </div>
        <p className="text-xs text-vt-text-secondary">@{user.username}</p>
        <p className="mt-0.5 text-xs text-vt-vip">{user.badgeLabel ?? getRank(user.level)}</p>
      </div>
      {cta}
    </div>
  );
}
