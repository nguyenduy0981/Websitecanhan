"use client";

import { Bell } from "lucide-react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "@/vo-tri/ui/BottomSheet";
import { EmptyState } from "@/vo-tri/ui/StatePanel";

/**
 * Notification layer: architecture is real (trigger + sheet + list slot),
 * content is honest — there's no backend notification feed yet, so it
 * shows the empty state rather than fabricated items. Swap the body for a
 * real list once notifications exist; the trigger/shell stays the same.
 */
export function NotificationBell({ hasUnread = false }: { hasUnread?: boolean }) {
  return (
    <BottomSheet>
      <BottomSheetTrigger asChild>
        <button
          type="button"
          aria-label="Thông báo"
          className="vt-interactive relative flex h-9 w-9 items-center justify-center rounded-vt-full text-vt-text-secondary hover:bg-vt-surface hover:text-vt-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-vt-full bg-vt-primary shadow-vt-glow-primary" />
          )}
        </button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetTitle>Thông báo</BottomSheetTitle>
        <BottomSheetDescription>Mọi thứ đáng chú ý sẽ xuất hiện ở đây.</BottomSheetDescription>
        <EmptyState
          title="Yên ắng quá..."
          description="Đáng ngờ đấy. Nhưng thôi, tận hưởng sự yên bình đi — chưa có thông báo nào cả."
        />
      </BottomSheetContent>
    </BottomSheet>
  );
}
