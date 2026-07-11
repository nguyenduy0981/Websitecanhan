"use client";

import { useState } from "react";
import { inputClass } from "@/lib/ui-classes";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
  className?: string;
};

/** Password input with a show/hide toggle. Visibility state is purely
 * local UI state — never affects what gets submitted. */
export function PasswordToggleInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  className,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-16`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="lb-btn absolute inset-y-0 right-1 my-1 rounded px-2 text-xs font-medium opacity-60 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {visible ? "Ẩn" : "Hiện"}
        </button>
      </div>
    </div>
  );
}
