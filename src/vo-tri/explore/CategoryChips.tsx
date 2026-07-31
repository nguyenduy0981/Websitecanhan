import { ChipGroup, type ChipOption } from "@/vo-tri/ui/ChipGroup";
import { CATEGORY_LABEL } from "./types";

export type ChipValue = "all" | keyof typeof CATEGORY_LABEL | "sap-ra-mat";

const CHIPS: ChipOption<ChipValue>[] = [
  { value: "all", label: "Tất cả" },
  { value: "may-man", label: CATEGORY_LABEL["may-man"] },
  { value: "thu-thach", label: CATEGORY_LABEL["thu-thach"] },
  { value: "giai-tri", label: CATEGORY_LABEL["giai-tri"] },
  { value: "nhanh", label: CATEGORY_LABEL.nhanh },
  { value: "sap-ra-mat", label: "Sắp ra mắt" },
];

export function CategoryChips({ active, onChange }: { active: ChipValue; onChange: (value: ChipValue) => void }) {
  return <ChipGroup options={CHIPS} active={active} onChange={onChange} ariaLabel="Lọc theo thể loại" />;
}
