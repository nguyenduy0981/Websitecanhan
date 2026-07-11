"use client";

import type { ButtonHTMLAttributes } from "react";
import { buttonClass, buttonPrimaryClass, spinnerClass } from "@/lib/ui-classes";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  submitting: boolean;
  label: string;
  submittingLabel: string;
  variant?: "primary" | "default";
};

/** Submit button that always reflects in-flight state via a spinner +
 * relabel — never a static button while a request is pending. */
export function SubmitButton({
  submitting,
  label,
  submittingLabel,
  variant = "default",
  className,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      type="submit"
      disabled={submitting || disabled}
      className={`${variant === "primary" ? buttonPrimaryClass : buttonClass} inline-flex items-center justify-center gap-2 ${className ?? ""}`}
      {...rest}
    >
      {submitting && <span className={spinnerClass} aria-hidden="true" />}
      {submitting ? submittingLabel : label}
    </button>
  );
}
