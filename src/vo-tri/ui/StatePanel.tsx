import type { ReactNode } from "react";
import { emptyCopy, errorCopy, successCopy } from "@/vo-tri/copy/microcopy";
import { cn } from "@/vo-tri/lib/cn";
import { Mascot, type MascotMood } from "./Mascot";

/**
 * Shared layout for the three "nothing/something went wrong/it worked"
 * screens — they're the same shape (mascot, title, description, optional
 * action) with different mood/tone, so EmptyState/ErrorState/SuccessState
 * below are thin presets over this rather than three copies of the same
 * flex column.
 */
function StatePanel({
  mood,
  title,
  description,
  action,
  className,
}: {
  mood: MascotMood;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("vt-fade-up flex flex-col items-center gap-4 px-6 py-12 text-center", className)}>
      <Mascot mood={mood} size="lg" />
      <div className="flex flex-col gap-1.5">
        <p className="font-vt-display text-lg font-semibold text-vt-text-primary">{title}</p>
        {description && <p className="max-w-sm text-sm text-vt-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title = emptyCopy.generic.title,
  description = emptyCopy.generic.description,
  action,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return <StatePanel mood="sleepy" title={title} description={description} action={action} className={className} />;
}

export function ErrorState({
  title = errorCopy.generic.title,
  description = errorCopy.generic.description,
  action,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return <StatePanel mood="mindblown" title={title} description={description} action={action} className={className} />;
}

export function SuccessState({
  title = successCopy.generic.title,
  description = successCopy.generic.description,
  action,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <StatePanel
      mood="celebrating"
      title={title}
      description={description}
      action={action}
      className={cn("vt-celebrate", className)}
    />
  );
}
