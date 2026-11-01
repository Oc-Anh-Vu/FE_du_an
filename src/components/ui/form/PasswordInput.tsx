import { forwardRef, useId, useState } from "react";
import { Input, type InputProps } from "./Input";
import { cn } from "../../../utils/cn";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  showStrengthMeter?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrengthMeter = false, value, defaultValue, onChange, id, ...props }, ref) => {
    const generatedId = useId();
    const strengthId = `${id ?? generatedId}-strength`;
    const [show, setShow] = useState(false);
    const [internalValue, setInternalValue] = useState(() => String(defaultValue ?? ""));
    const passwordValue = value === undefined ? internalValue : String(value);
    const toggleShow = () => setShow((prev) => !prev);

    const EyeIcon = show ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    );

    const strength = passwordValue
      ? [
          passwordValue.length >= 8,
          /[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue),
          /\d/.test(passwordValue),
          /[^A-Za-z0-9]/.test(passwordValue),
        ].filter(Boolean).length
      : 0;
    const strengthLabels = ["", "Yếu", "Trung bình", "Khá", "Mạnh"];

    return (
      <div className="w-full">
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          value={value}
          defaultValue={defaultValue}
          id={id}
          onChange={(event) => {
            if (value === undefined) setInternalValue(event.currentTarget.value);
            onChange?.(event);
          }}
          rightIcon={
            <button
              type="button"
              onClick={toggleShow}
              disabled={props.disabled}
              className="focus-ring rounded-control text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={show}
            >
              <span aria-hidden="true">{EyeIcon}</span>
            </button>
          }
          {...props}
        />
        {showStrengthMeter && passwordValue.length > 0 && (
          <div id={strengthId} className="mt-2 flex flex-col gap-1" aria-live="polite">
            <div className="flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map((segment) => (
                <span key={segment} className={cn(
                  "h-1.5 flex-1 rounded-full",
                  segment >= strength ? "bg-muted"
                    : strength <= 1 ? "bg-danger"
                    : strength === 2 ? "bg-warning"
                    : "bg-success",
                )} />
              ))}
            </div>
            <span className="text-caption text-muted-foreground">{strengthLabels[Math.max(1, strength)]}</span>
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
