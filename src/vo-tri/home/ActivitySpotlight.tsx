import { Card, CardContent } from "@/vo-tri/ui/Card";
import { Mascot } from "@/vo-tri/ui/Mascot";

export interface SpotlightItem {
  kind: "achievement" | "challenge" | "activity";
  text: string;
}

/**
 * "Giới thiệu bằng trải nghiệm, không liệt kê tính năng" — but there is no
 * real activity feed yet, so this renders one genuine, on-brand empty
 * state instead of a fabricated "Minh vừa đạt thành tích X" placeholder.
 * Pass a real `item` once an activity feed exists; the empty branch stays
 * for whenever the feed is genuinely quiet, not just pre-launch.
 */
export function ActivitySpotlight({ item }: { item?: SpotlightItem }) {
  if (!item) {
    return (
      <Card variant="glass" className="flex items-center gap-4">
        <Mascot mood="thinking" size="md" />
        <CardContent className="text-left">
          <p className="font-vt-display text-sm font-semibold text-vt-text-primary">Chưa có gì nổi bật ở đây...</p>
          <p className="text-sm text-vt-text-secondary">vì bạn chưa xuất hiện. Vào xem thử có gì hay không.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="flex items-center gap-4">
      <Mascot mood="mindblown" size="md" />
      <CardContent className="text-left text-sm text-vt-text-primary">{item.text}</CardContent>
    </Card>
  );
}
