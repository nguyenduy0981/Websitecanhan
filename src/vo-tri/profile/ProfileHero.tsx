import { Calendar } from "lucide-react";
import { Badge } from "@/vo-tri/ui/Badge";
import { getRank } from "./ranks";
import { ProfileAvatar } from "./ProfileAvatar";
import type { ProfileIdentity } from "./types";

function formatJoinDate(date: Date): string {
  return `Tham gia ${date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}`;
}

export function ProfileHero({
  identity,
  level,
  editable,
  onEditAvatar,
}: {
  identity: ProfileIdentity;
  level: number;
  editable?: boolean;
  onEditAvatar?: () => void;
}) {
  return (
    <div className="vt-fade-up relative overflow-hidden rounded-vt-xl border border-vt-border bg-vt-card p-6 sm:p-8">
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-vt-gradient-brand opacity-[0.16] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-vt-vip opacity-[0.12] blur-[110px]" />

      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <ProfileAvatar
          name={identity.displayName}
          avatarUrl={identity.avatarUrl}
          online={identity.online}
          size="xl"
          editable={editable}
          onEdit={onEditAvatar}
        />

        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="font-vt-display text-2xl font-extrabold text-vt-text-primary">{identity.displayName}</h1>
            <Badge variant="xp">Lv.{level}</Badge>
            <Badge variant="vip">{getRank(level)}</Badge>
          </div>
          <p className="text-sm text-vt-text-secondary">@{identity.username}</p>
          {identity.tagline && <p className="max-w-md text-sm text-vt-text-primary">&ldquo;{identity.tagline}&rdquo;</p>}
          <p className="flex items-center gap-1.5 text-xs text-vt-text-secondary">
            <Calendar className="h-3.5 w-3.5" /> {formatJoinDate(identity.joinedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
