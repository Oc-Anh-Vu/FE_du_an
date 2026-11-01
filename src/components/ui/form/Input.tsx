import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightIcon, id: externalId, required, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={cn("w-full space-y-1.5", className)}>
        {label && (
          <label htmlFor={id} className="block text-body-sm font-semibold text-foreground">
            {label} {required && <span aria-hidden="true" className="ml-0.5 text-danger">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{leftIcon}</span>}
          <input
            ref={ref}
            id={id}
            required={required}
            className={cn(
              "focus-ring h-11 w-full rounded-control border border-input bg-card px-4 text-body text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-12",
              error && "border-danger focus-visible:ring-danger",
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>}
        </div>
        {error && <p id={errorId} className="text-caption font-semibold text-danger">{error}</p>}
        {hint && !error && <p id={hintId} className="text-caption text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
