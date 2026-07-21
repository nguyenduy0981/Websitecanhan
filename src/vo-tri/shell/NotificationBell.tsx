"use client";

import { Bell } from "lucide-react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "@/vo-tri/ui/BottomSheet";
import { NotificationCenter } from "@/vo-tri/social/NotificationCenter";
import type { NotificationItem } from "@/vo-tri/social/types";

// No backend notification feed yet — every real caller passes an empty
// array, so NotificationCenter renders its honest empty state. Kept as a
// module constant (not re-created per render) since it's always the same
// empty reference.
const notifications: NotificationItem[] = [];

/**
 * Notification layer: architecture is real (trigger + sheet + categorized
 * list, see src/vo-tri/social/NotificationCenter.tsx), content is honest
 * — swap `notifications` for a real fetch once a backend exists; the
 * trigger/shell stays the same.
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
        <div className="mt-4">
          <NotificationCenter items={notifications} />
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
