import { Compass, Home, Trophy, User } from "lucide-react";

/**
 * Single source of truth for primary navigation — BottomNav (mobile) and
 * Sidebar (desktop) both render from this list instead of maintaining two
 * copies that can drift. Routes beyond "/" don't exist as real pages yet
 * (Explore/Leaderboard/Profile are out of scope until their own prompts);
 * linking to them now is deliberate — the nav IS the architecture prompt
 * 02 asks for, and a real (branded) 404 is the correct behavior for a
 * route that's genuinely not built yet, not a reason to fake the link.
 */
export const navItems = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/explore", label: "Khám phá", icon: Compass },
  { href: "/leaderboard", label: "Xếp hạng", icon: Trophy },
  { href: "/profile", label: "Hồ sơ", icon: User },
] as const;

export type NavItem = (typeof navItems)[number];
