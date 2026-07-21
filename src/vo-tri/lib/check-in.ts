import { toast } from "@/vo-tri/ui/toast";

/** The one check-in reward toast, fired from BottomNav/Sidebar/QuickAccess/Explore's check-in activity — previously copy-pasted in all four places. */
export function fireCheckInToast() {
  toast({
    variant: "success",
    title: "+15 Điểm Vô Tri",
    description: "Điểm danh hôm nay thành công. Mai quay lại nhé!",
  });
}
