"use client";

import { useState } from "react";
import { successCopy } from "@/vo-tri/copy/microcopy";
import { useMediaQuery } from "@/vo-tri/lib/use-media-query";
import { BottomSheet, BottomSheetContent, BottomSheetDescription, BottomSheetTitle } from "@/vo-tri/ui/BottomSheet";
import { Button } from "@/vo-tri/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/vo-tri/ui/Dialog";
import { Field, Input, Textarea } from "@/vo-tri/ui/Input";
import { toast } from "@/vo-tri/ui/toast";
import { ProfileAvatar } from "./ProfileAvatar";

const NAME_MAX = 24;
const TAGLINE_MAX = 60;

interface EditProfileValues {
  displayName: string;
  tagline: string;
}

/**
 * Same form content renders inside a Dialog on desktop (`md:`+) and a
 * BottomSheet on mobile — "Bottom Sheet trên mobile, Dialog trên desktop"
 * from a single source of truth via one media-query hook, rather than two
 * hand-maintained copies of the form.
 */
export function EditProfileSheet({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: EditProfileValues;
  onSave?: (values: EditProfileValues) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState(false);

  const nameError = touched && values.displayName.trim().length === 0 ? "Tên hiển thị không được để trống." : undefined;

  function handleSave() {
    setTouched(true);
    if (values.displayName.trim().length === 0) return;
    onSave?.(values);
    toast({ variant: "success", title: successCopy.saved.title });
    onOpenChange(false);
  }

  const form = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 rounded-vt-lg border border-vt-border bg-vt-surface p-4">
        <ProfileAvatar name={values.displayName || "?"} size="md" />
        <p className="font-vt-display text-sm font-semibold text-vt-text-primary">{values.displayName || "Tên hiển thị"}</p>
        {values.tagline && <p className="max-w-xs text-center text-xs text-vt-text-secondary">&ldquo;{values.tagline}&rdquo;</p>}
      </div>

      <Field label="Tên hiển thị" error={nameError} required>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            value={values.displayName}
            maxLength={NAME_MAX}
            onChange={(e) => setValues((v) => ({ ...v, displayName: e.target.value }))}
            onBlur={() => setTouched(true)}
            placeholder="Nhập tên hiển thị..."
          />
        )}
      </Field>

      <Field label="Tagline cá nhân" helper={`${values.tagline.length}/${TAGLINE_MAX} ký tự`}>
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={values.tagline}
            maxLength={TAGLINE_MAX}
            onChange={(e) => setValues((v) => ({ ...v, tagline: e.target.value }))}
            placeholder="Một câu vô tri về chính bạn..."
            className="min-h-16"
          />
        )}
      </Field>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
            <DialogDescription>Đổi tên, tagline — xem trước ngay bên dưới.</DialogDescription>
          </DialogHeader>
          {form}
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Thôi, để sau
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        <BottomSheetTitle>Chỉnh sửa hồ sơ</BottomSheetTitle>
        <BottomSheetDescription>Đổi tên, tagline — xem trước ngay bên dưới.</BottomSheetDescription>
        <div className="mt-4">{form}</div>
        <Button variant="primary" size="lg" className="mt-6 w-full" onClick={handleSave}>
          Lưu lại
        </Button>
      </BottomSheetContent>
    </BottomSheet>
  );
}
