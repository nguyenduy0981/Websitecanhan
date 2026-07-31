"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { errorCopy } from "@/vo-tri/copy/microcopy";
import { listMyFollowingAction, startCourtTrialAction } from "@/vo-tri/server/actions/court-actions";
import { UserPreviewCard } from "@/vo-tri/social/UserPreviewCard";
import type { UserPreview } from "@/vo-tri/social/types";
import { Button } from "@/vo-tri/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/vo-tri/ui/Dialog";
import { Mascot } from "@/vo-tri/ui/Mascot";
import { toast } from "@/vo-tri/ui/toast";
import type { Dilemma } from "./types";

/**
 * "Start a Trial" — always uses today's Vô Tri Đồng Thuận dilemma rather
 * than a separate dilemma picker: per docs/VO_TRI_PRODUCT_BIBLE.md Part
 * 1.3's documented merge, the daily poll IS the trial content pool, and
 * building a second "pick a dilemma" UI would just duplicate that catalog
 * browsing experience for no real MVP benefit. The friend list is fetched
 * on open (not passed as a prop) since this Dialog mounts once and opens
 * on demand — no reason to fetch it before the user has expressed intent.
 */
export function StartTrialSheet({
  dilemma,
  open,
  onOpenChange,
}: {
  dilemma: Dilemma;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<UserPreview[] | null>(null);
  const [challenging, setChallenging] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listMyFollowingAction()
      .then((result) => setFriends(result.ok ? result.data : []))
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleChallenge(friend: UserPreview) {
    if (!friend.id) return;
    setChallenging(friend.id);

    let result;
    try {
      result = await startCourtTrialAction(friend.id, dilemma.id);
    } catch {
      setChallenging(null);
      toast({ variant: "danger", ...errorCopy.generic });
      return;
    }
    setChallenging(null);

    if (!result.ok) {
      toast({ variant: "danger", title: result.error.title, description: result.error.description });
      return;
    }

    onOpenChange(false);
    toast({ variant: "success", title: `Đã đưa ${friend.name} ra Toà`, description: "Chờ họ trả lời để có kết quả." });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đưa một người bạn ra Toà</DialogTitle>
          <DialogDescription>Cả hai sẽ trả lời cùng một câu hỏi, độc lập — Toà tuyên án khi cả hai đã trả lời.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-6 text-center text-sm text-vt-text-secondary">Đang tải danh sách bạn bè...</p>
        ) : !friends || friends.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Mascot mood="thinking" size="md" />
            <p className="text-sm text-vt-text-secondary">Bạn chưa theo dõi ai để thách đấu.</p>
          </div>
        ) : (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {friends.map((friend) => (
              <UserPreviewCard
                key={friend.id}
                user={friend}
                cta={
                  <Button size="sm" disabled={challenging !== null} onClick={() => handleChallenge(friend)}>
                    Thách đấu
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
