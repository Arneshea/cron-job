import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const fieldBase =
  "w-full rounded-[var(--radius-sm)] bg-ink-900 border border-ink-600 px-3 py-2.5 text-sm text-fog-100 placeholder:text-fog-700 outline-none transition-colors focus:border-signal-amber disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${fieldBase} ${className}`} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea ref={ref} className={`${fieldBase} resize-none ${className}`} {...props} />
));
Textarea.displayName = "Textarea";

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-fog-300">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-fog-700">{hint}</p>}
      {error && <p className="text-xs text-signal-coral">{error}</p>}
    </div>
  );
}
