"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authCopy, errorCopy } from "@/vo-tri/copy/microcopy";
import { signInAction, signUpAction } from "@/vo-tri/server/actions/auth-actions";
import { Button } from "@/vo-tri/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/vo-tri/ui/Dialog";
import { Field, Input } from "@/vo-tri/ui/Input";
import { toast } from "@/vo-tri/ui/toast";

type Mode = "signIn" | "signUp";

const EMPTY_FORM = { email: "", password: "", username: "", displayName: "" };

/**
 * Real Auth UI, wired to signInAction/signUpAction (src/vo-tri/server/actions/auth-actions.ts).
 * On success, router.refresh() re-runs RootLayout's getSessionUser() so
 * Header/Sidebar pick up the real session on the very next render — no
 * separate client-side auth store needed since the shell's user comes from
 * a Server Component.
 */
export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signIn");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  function reset() {
    setForm(EMPTY_FORM);
    setFormError(undefined);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    setSubmitting(true);

    let result;
    try {
      result =
        mode === "signIn"
          ? await signInAction({ email: form.email, password: form.password })
          : await signUpAction({
              email: form.email,
              password: form.password,
              username: form.username,
              displayName: form.displayName,
            });
    } catch {
      // createServerSupabaseClient() throws loudly when Supabase isn't
      // configured (deliberate, for developers) — a real end user submitting
      // this form should see a graceful message, not a crash.
      setSubmitting(false);
      setFormError(errorCopy.generic.description);
      return;
    }

    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error.description);
      return;
    }

    // Sign-up when the Supabase project requires email confirmation (its
    // own default) never establishes a session — `router.refresh()` would
    // silently re-render the still-logged-out shell, and the "success"
    // toast would be a lie. Tell the user to check their email instead,
    // and don't pretend a session exists that doesn't.
    if (mode === "signUp" && "needsEmailConfirmation" in result.data && result.data.needsEmailConfirmation) {
      toast({ variant: "success", ...authCopy.confirmEmailSent });
      handleOpenChange(false);
      return;
    }

    toast({ variant: "success", title: mode === "signIn" ? authCopy.signedIn.title : authCopy.signedUp.title });
    handleOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "signIn" ? "Đăng nhập" : "Tạo tài khoản"}</DialogTitle>
          <DialogDescription>
            {mode === "signIn" ? "Vào lại thế giới vô tri của bạn." : "Chỉ mất chưa đầy một phút."}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex gap-1 rounded-vt-md bg-vt-surface p-1">
          <button
            type="button"
            onClick={() => setMode("signIn")}
            className={`vt-interactive flex-1 rounded-vt-sm py-2 text-sm font-semibold transition-colors ${
              mode === "signIn" ? "bg-vt-card text-vt-text-primary shadow-vt-1" : "text-vt-text-secondary"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode("signUp")}
            className={`vt-interactive flex-1 rounded-vt-sm py-2 text-sm font-semibold transition-colors ${
              mode === "signUp" ? "bg-vt-card text-vt-text-primary shadow-vt-1" : "text-vt-text-secondary"
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signUp" && (
            <Field label="Tên hiển thị" required>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  placeholder="Bé Vô Tri"
                  required
                />
              )}
            </Field>
          )}

          {mode === "signUp" && (
            <Field label="Username" helper="Chỉ chữ thường, số và dấu gạch dưới.">
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
                  placeholder="be_vo_tri"
                  required
                />
              )}
            </Field>
          )}

          <Field label="Email" required>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="ban@email.com"
                required
              />
            )}
          </Field>

          <Field label="Mật khẩu" required helper={mode === "signUp" ? "Ít nhất 8 ký tự." : undefined} error={formError}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            )}
          </Field>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
            {mode === "signIn" ? "Đăng nhập" : "Tạo tài khoản"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
