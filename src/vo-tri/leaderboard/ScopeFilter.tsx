import { ChipGroup, type ChipOption } from "@/vo-tri/ui/ChipGroup";
import { SCOPE_LABEL, type LeaderboardScope } from "./types";

const SCOPES: ChipOption<LeaderboardScope>[] = (Object.keys(SCOPE_LABEL) as LeaderboardScope[]).map((value) => ({
  value,
  label: SCOPE_LABEL[value],
}));

export function ScopeFilter({ active, onChange }: { active: LeaderboardScope; onChange: (value: LeaderboardScope) => void }) {
  return <ChipGroup options={SCOPES} active={active} onChange={onChange} ariaLabel="Lọc bảng xếp hạng" />;
}
