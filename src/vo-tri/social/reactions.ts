import { Brain, Flame, Heart, Laugh, PartyPopper } from "lucide-react";
import type { ReactionKind } from "./types";

/**
 * The reaction vocabulary itself is real designed content (like Explore's
 * activity catalog) — deliberately not a Facebook-style Like/Haha/Wow/
 * Sad/Angry set, and not "Like"-only. "Vô Tri" is the signature one: a
 * brand-flavored reaction for "this broke my brain in the best way",
 * distinct from anything a generic template would ship.
 */
export const REACTION_KINDS: ReactionKind[] = [
  { id: "thich", label: "Thích", icon: Heart },
  { id: "cuoi", label: "Cười xỉu", icon: Laugh },
  { id: "dinh", label: "Đỉnh", icon: Flame },
  { id: "bat-ngo", label: "Bất ngờ", icon: PartyPopper },
  { id: "vo-tri", label: "Vô Tri", icon: Brain },
];
