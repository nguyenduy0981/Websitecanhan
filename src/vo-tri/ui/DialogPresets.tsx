"use client";

import type { ReactNode } from "react";
import { actionCopy, errorCopy, successCopy } from "@/vo-tri/copy/microcopy";
import { cn } from "@/vo-tri/lib/cn";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./Dialog";
import { Mascot } from "./Mascot";

interface PresetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Four dialog personalities sharing one base (src/vo-tri/ui/Dialog.tsx) so
 * "confirm before an action", "something broke", "you got something",
 * and "it worked" each read distinctly without becoming four unrelated
 * components — every prompt going forward should reach for one of these
 * instead of composing raw <Dialog> for these four situations.
 */

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = actionCopy.confirm,
  cancelLabel = actionCopy.cancel,
  destructive,
  onConfirm,
}: PresetProps & {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ErrorDialog({
  open,
  onOpenChange,
  title = errorCopy.generic.title,
  description = errorCopy.generic.description,
  onRetry,
}: PresetProps & { title?: ReactNode; description?: ReactNode; onRetry?: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <div className="flex flex-col items-center gap-4">
          <Mascot mood="mindblown" size="lg" />
          <div>
            <p className="font-vt-display text-lg font-semibold text-vt-text-primary">{title}</p>
            <p className="mt-1 text-sm text-vt-text-secondary">{description}</p>
          </div>
        </div>
        <DialogFooter className="justify-center">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {actionCopy.close}
          </Button>
          {onRetry && (
            <Button
              variant="danger"
              onClick={() => {
                onRetry();
                onOpenChange(false);
              }}
            >
              {actionCopy.retry}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SuccessDialog({
  open,
  onOpenChange,
  title = successCopy.generic.title,
  description = successCopy.generic.description,
}: PresetProps & { title?: ReactNode; description?: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("text-center", "data-[state=open]:vt-celebrate")}>
        <div className="flex flex-col items-center gap-4">
          <Mascot mood="celebrating" size="lg" />
          <div>
            <p className="font-vt-display text-lg font-semibold text-vt-text-primary">{title}</p>
            <p className="mt-1 text-sm text-vt-text-secondary">{description}</p>
          </div>
        </div>
        <DialogFooter className="justify-center">
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            Tuyệt vời
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RewardDialog({
  open,
  onOpenChange,
  rewardLabel,
  title = "Bạn vừa nhận được!",
  description,
}: PresetProps & { rewardLabel: ReactNode; title?: ReactNode; description?: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <div className="flex flex-col items-center gap-4">
          <Mascot mood="celebrating" size="xl" />
          <p className="font-vt-display text-lg font-semibold text-vt-text-primary">{title}</p>
          <Badge variant="reward" className="vt-bounce-in px-4 py-2 text-base">
            {rewardLabel}
          </Badge>
          {description && <p className="text-sm text-vt-text-secondary">{description}</p>}
        </div>
        <DialogFooter className="justify-center">
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            Ngon, cất vào túi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
