import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/vo-tri/lib/cn";

const fieldBaseClass =
  "vt-interactive w-full rounded-vt-md border bg-vt-surface px-4 py-2.5 text-vt-text-primary placeholder:text-vt-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vt-bg disabled:pointer-events-none disabled:opacity-40";

function fieldStateClass(invalid?: boolean) {
  return invalid
    ? "border-vt-danger vt-shake"
    : "border-vt-border hover:border-vt-text-secondary focus-visible:border-vt-primary";
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, invalid, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(fieldBaseClass, fieldStateClass(invalid), className)}
    {...props}
  />
));
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(fieldBaseClass, fieldStateClass(invalid), "min-h-28 resize-y", className)}
    {...props}
  />
));
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
