import { ProfileAvatar } from "@/vo-tri/profile/ProfileAvatar";
import { Badge } from "@/vo-tri/ui/Badge";
import { Button } from "@/vo-tri/ui/Button";
import { Card, CardContent } from "@/vo-tri/ui/Card";
import { describeVerdict, getOpponent, isInitiator } from "./trial-helpers";
import type { CourtTrial } from "./types";

/** One Toà Án Vô Tri trial, in every state it can be in — pending (mine to answer, or waiting on the other side) or resolved (verdict + both choices revealed). */
export function CourtTrialCard({
  trial,
  currentUserId,
  onAnswer,
}: {
  trial: CourtTrial;
  currentUserId: string;
  onAnswer?: (trial: CourtTrial) => void;
}) {
  const opponent = getOpponent(trial, currentUserId);
  const iAmInitiator = isInitiator(trial, currentUserId);
  const needsMyAnswer = trial.status === "pending" && !trial.myChoice;

  return (
    <Card variant="elevated" padding="sm">
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ProfileAvatar name={opponent.name} avatarUrl={opponent.avatarUrl} size="md" />
            <div>
              <p className="text-sm font-medium text-vt-text-primary">{opponent.name}</p>
              <p className="text-xs text-vt-text-secondary">{iAmInitiator ? "Bạn đã khởi kiện" : "Đã đưa bạn ra Toà"}</p>
            </div>
          </div>
          <Badge variant={trial.status === "resolved" ? "success" : "neutral"}>
            {trial.status === "resolved" ? "Đã tuyên án" : "Đang chờ"}
          </Badge>
        </div>

        <p className="text-sm text-vt-text-primary">{trial.dilemma.prompt}</p>

        {trial.status === "resolved" ? (
          <div className="flex flex-col gap-1 rounded-vt-md bg-vt-surface px-3 py-2 text-xs text-vt-text-secondary">
            <p>
              Bạn chọn:{" "}
              <span className="font-medium text-vt-text-primary">
                {trial.myChoice === "a" ? trial.dilemma.optionA : trial.dilemma.optionB}
              </span>
            </p>
            <p>
              {opponent.name} chọn:{" "}
              <span className="font-medium text-vt-text-primary">
                {trial.otherChoice === "a" ? trial.dilemma.optionA : trial.dilemma.optionB}
              </span>
            </p>
            <p className="mt-1 font-vt-display font-semibold text-vt-vip">{describeVerdict(trial, currentUserId)}</p>
          </div>
        ) : needsMyAnswer ? (
          <Button variant="primary" size="sm" onClick={() => onAnswer?.(trial)}>
            Trả lời
          </Button>
        ) : (
          <p className="text-xs text-vt-text-secondary">Bạn đã trả lời — chờ {opponent.name} trả lời để Toà tuyên án.</p>
        )}
      </CardContent>
    </Card>
  );
}
