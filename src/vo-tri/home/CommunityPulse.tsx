import { Users } from "lucide-react";

export interface CommunityStats {
  online: number;
  newMembersToday: number;
}

/**
 * Reserves the "social proof" area the brief asks for, without inventing
 * numbers — there's no real user base yet, so this shows an honest
 * "just getting started" line instead of three placeholder stat tiles
 * (which would visually read as real, hidden numbers rather than "none
 * yet"). Pass `stats` once there's a real count to show; the layout
 * becomes three tiles at that point, not before.
 */
export function CommunityPulse({ stats }: { stats?: CommunityStats }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-vt-full border border-vt-border bg-vt-surface/60 px-4 py-2.5 text-sm text-vt-text-secondary">
        <Users className="h-4 w-4 text-vt-secondary" />
        Cộng đồng đang được nhen nhóm — bạn có thể là người đầu tiên.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-6 rounded-vt-full border border-vt-border bg-vt-surface/60 px-6 py-2.5 text-sm">
      <span className="flex items-center gap-1.5 text-vt-text-secondary">
        <Users className="h-4 w-4 text-vt-success" />
        {stats.online} đang online
      </span>
      <span className="text-vt-text-secondary">+{stats.newMembersToday} thành viên mới hôm nay</span>
    </div>
  );
}
