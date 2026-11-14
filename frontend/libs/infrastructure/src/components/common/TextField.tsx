import { useId, type InputHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
};

export function TextField({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-label">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? descriptionId : undefined}
        className={`min-h-11 w-full rounded-xl border bg-input px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-muted ${
          error ? "border-error" : "border-border"
        } ${className}`}
        {...props}
      />
      {(hint || error) && (
        <p
          id={descriptionId}
          className={`text-xs ${error ? "text-error" : "text-muted"}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
