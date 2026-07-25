"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/vo-tri/ui/Button";
import { AuthDialog } from "./AuthDialog";

/**
 * Used to be a dead button (no onClick at all) in both Header and
 * /profile — a real UX bug found in audit: tapping the most prominent CTA
 * a logged-out visitor sees did nothing. Then it opened only a "chưa xây
 * auth thật" toast once Auth existed only as a design. Now it opens the
 * real AuthDialog, wired to signInAction/signUpAction.
 */
export function LoginButton(props: ButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)} {...props}>
        Đăng nhập
      </Button>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
