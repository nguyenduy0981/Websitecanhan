"use client";

import { notReadyCopy } from "@/vo-tri/copy/microcopy";
import { Button, type ButtonProps } from "@/vo-tri/ui/Button";
import { toast } from "@/vo-tri/ui/toast";

/**
 * No auth yet — this used to be a dead button (no onClick at all) in both
 * Header and /profile, a real UX bug found in audit: tapping the most
 * prominent CTA a logged-out visitor sees did nothing. Now it's honest
 * about why, same "not built yet" pattern as Explore's ComingSoonCard,
 * instead of silently doing nothing.
 */
export function LoginButton(props: ButtonProps) {
  return (
    <Button variant="primary" onClick={() => toast({ variant: "info", ...notReadyCopy.auth })} {...props}>
      Đăng nhập
    </Button>
  );
}
