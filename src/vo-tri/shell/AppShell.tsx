import type { ReactNode } from "react";
import { Background } from "@/vo-tri/ui/Background";
import { Toaster } from "@/vo-tri/ui/toast";
import { TooltipProvider } from "@/vo-tri/ui/Tooltip";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { OfflineWatcher } from "./OfflineWatcher";
import { Sidebar } from "./Sidebar";
import type { VoTriUser } from "./types";

/**
 * The one shell every route mounts inside (wired in src/app/layout.tsx).
 * Screens only ever place content into <main> — header/nav/background/
 * toast layer are handled here once, for the whole app. TooltipProvider
 * wraps everything once here so any component can use <Tooltip/> without
 * re-declaring its own provider (shared delayDuration too).
 */
export function AppShell({ children, user }: { children: ReactNode; user?: VoTriUser }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Background />
      <Header user={user} />
      <Sidebar />
      <main className="min-h-screen pb-28 pt-20 md:pl-60 md:pb-10">{children}</main>
      <BottomNav />
      <Toaster />
      <OfflineWatcher />
    </TooltipProvider>
  );
}
