"use client";

import { useEffect, useRef } from "react";
import { offlineCopy } from "@/vo-tri/copy/microcopy";
import { useOnlineStatus } from "@/vo-tri/lib/use-online-status";
import { toast } from "@/vo-tri/ui/toast";

/**
 * Real, functional offline detection (navigator.onLine + online/offline
 * events) — mounted once in AppShell, renders nothing itself. A toast is
 * simpler and safer than a persistent banner here: no extra layout math
 * for header height / content padding to get wrong, and the existing
 * Toaster is already mounted globally.
 */
export function OfflineWatcher() {
  const online = useOnlineStatus();
  // Skip the toast on first mount — `online` starts true and we don't
  // want a "back online!" toast just because the app loaded.
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (online) {
      toast({ variant: "success", title: "Đã có mạng lại rồi!", description: "VÔ TRI quay lại bình thường." });
    } else {
      toast({ variant: "danger", title: offlineCopy.title, description: offlineCopy.description, duration: 8000 });
    }
  }, [online]);

  return null;
}
