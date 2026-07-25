"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorCopy } from "@/vo-tri/copy/microcopy";
import { signOutAction } from "@/vo-tri/server/actions/auth-actions";
import { Avatar } from "@/vo-tri/ui/Avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/vo-tri/ui/Tooltip";
import { toast } from "@/vo-tri/ui/toast";
import type { VoTriUser } from "./types";

/**
 * Real logged-in state next to Header's avatar. A full dropdown menu (Radix
 * DropdownMenu) would be the eventual right primitive once there's more
 * than one action here — for just "Đăng xuất" today, a single Tooltip-
 * labeled button avoids introducing a new primitive for one item.
 */
export function UserMenu({ user }: { user: VoTriUser }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);

    let result;
    try {
      result = await signOutAction();
    } catch {
      setSigningOut(false);
      toast({ variant: "danger", ...errorCopy.generic });
      return;
    }

    setSigningOut(false);

    if (!result.ok) {
      toast({ variant: "danger", title: result.error.title, description: result.error.description });
      return;
    }
    toast({ variant: "default", title: "Đã đăng xuất" });
    router.refresh();
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          aria-label="Đăng xuất"
          className="vt-interactive rounded-vt-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary disabled:opacity-60"
        >
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size={36} className="border border-vt-border" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Đăng xuất</TooltipContent>
    </Tooltip>
  );
}
