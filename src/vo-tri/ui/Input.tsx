import { Check, Loader2 } from "lucide-react";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/vo-tri/lib/cn";

const fieldBaseClass =
  "vt-interactive w-full rounded-vt-md border bg-vt-surface px-4 py-2.5 text-vt-text-primary placeholder:text-vt-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vt-bg disabled:pointer-events-none disabled:opacity-40";

/** Standardized across every field in the product: invalid > success > readonly > default, so no form ever has to invent its own state colors. */
function fieldStateClass(invalid?: boolean, success?: boolean, readOnly?: boolean) {
  if (invalid) return "border-vt-danger vt-shake";
  if (success) return "border-vt-success";
  if (readOnly) return "border-vt-border bg-vt-card text-vt-text-secondary cursor-default";
  return "border-vt-border hover:border-vt-text-secondary focus-visible:border-vt-primary";
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** e.g. a username check that just came back available — shows a check icon, doesn't disable the field. */
  success?: boolean;
  /** e.g. an async validation in flight — shows a spinner icon, doesn't disable the field. */
  loading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, success, loading, readOnly, ...props }, ref) => {
    const hasTrailingIcon = loading || success;
    const input = (
      <input
        ref={ref}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        aria-busy={loading || undefined}
        className={cn(
          fieldBaseClass,
          fieldStateClass(invalid, success, readOnly),
          hasTrailingIcon && "pr-10",
          className,
        )}
        {...props}
      />
    );

    if (!hasTrailingIcon) return input;

    return (
      <div className="relative">
        {input}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-vt-text-secondary" />
          ) : (
            <Check className="h-4 w-4 text-vt-success" />
          )}
        </span>
      </div>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  success?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, success, readOnly, ...props }, ref) => (
    <textarea
      ref={ref}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      className={cn(fieldBaseClass, fieldStateClass(invalid, success, readOnly), "min-h-28 resize-y", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

/**
 * Composes a visible label + the field + an error/helper line under one
 * generated id, so every form field in the product gets the same
 * label/error wiring (and the same a11y guarantees — `htmlFor`,
 * `aria-describedby`, `aria-invalid`) without each call site re-deriving
 * ids by hand.
 */
export function Field({
  label,
  error,
  helper,
  required,
  children,
}: {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
  children: (fieldProps: { id: string; invalid: boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-vt-text-primary">
        {label}
        {required && <span className="ml-1 text-vt-danger">*</span>}
      </label>
      {children({ id, invalid: Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="vt-pop-in text-sm text-vt-danger">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-helper`} className="text-sm text-vt-text-secondary">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
