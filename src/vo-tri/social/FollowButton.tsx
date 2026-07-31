import { Check, UserPlus } from "lucide-react";
import { Button } from "@/vo-tri/ui/Button";

/** Controlled, no real follow logic ("không cần logic, chỉ chuẩn bị giao diện") — the caller owns `following` state; this just renders the two visual states and reports taps. */
export function FollowButton({ following, onToggle }: { following: boolean; onToggle: () => void }) {
  return (
    <Button variant={following ? "outline" : "primary"} size="sm" onClick={onToggle} aria-pressed={following}>
      {following ? (
        <>
          <Check className="h-4 w-4" aria-hidden /> Đang theo dõi
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" aria-hidden /> Theo dõi
        </>
      )}
    </Button>
  );
}
