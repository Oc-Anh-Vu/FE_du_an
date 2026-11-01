import { forwardRef, useId, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useControllableState } from "../../../hooks/useControllableState";

export interface OtpInputProps {
  length?: number;
  mode?: "numeric" | "alphanumeric";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  (
    {
      length = 6,
      mode = "numeric",
      value,
      defaultValue = "",
      onValueChange,
      onComplete,
      error,
      autoFocus = false,
      disabled = false,
      className,
      "aria-label": ariaLabel = "Mã xác nhận",
    },
    forwardedRef,
  ) => {
    const generatedId = useId();
    const safeLength = Math.max(1, Math.floor(length));
    const normalizedDefault = mode === "alphanumeric" ? defaultValue.toUpperCase() : defaultValue;
    const [otp, setOtp] = useControllableState({
      value,
      defaultValue: normalizedDefault.slice(0, safeLength),
      onChange: (next) => {
        onValueChange?.(next);
        if (next.length === safeLength && Array.from(next).every((char) => Boolean(char) && char !== " ")) {
          onComplete?.(next);
        }
      },
    });
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const assignFirstRef = (node: HTMLInputElement | null) => {
      inputRefs.current[0] = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const focusInput = (index: number) => inputRefs.current[index]?.focus();
    const isValidChar = (char: string) =>
      mode === "numeric" ? /^[0-9]$/.test(char) : /^[a-zA-Z0-9]$/.test(char);

    const updateAt = (index: number, char: string) => {
      const slots = otp.padEnd(safeLength, " ").slice(0, safeLength).split("");
      slots[index] = mode === "alphanumeric" ? char.toUpperCase() : char;
      setOtp(slots.join("").trimEnd());
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const chars = Array.from(event.currentTarget.value).filter(isValidChar);
      if (chars.length === 0) {
        updateAt(index, " ");
        return;
      }

      updateAt(index, chars[chars.length - 1]);
      if (index < safeLength - 1) focusInput(index + 1);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        const slots = otp.padEnd(safeLength, " ").slice(0, safeLength).split("");
        if (slots[index] !== " ") {
          updateAt(index, " ");
        } else if (index > 0) {
          updateAt(index - 1, " ");
          focusInput(index - 1);
        }
      } else if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        focusInput(index - 1);
      } else if (event.key === "ArrowRight" && index < safeLength - 1) {
        event.preventDefault();
        focusInput(index + 1);
      }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const chars = Array.from(event.clipboardData.getData("text/plain"))
        .filter(isValidChar)
        .slice(0, safeLength)
        .map((char) => mode === "alphanumeric" ? char.toUpperCase() : char);
      if (chars.length === 0) return;
      setOtp(chars.join(""));
      focusInput(Math.min(chars.length, safeLength - 1));
    };

    const errorId = error ? `${generatedId}-error` : undefined;

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ariaLabel} aria-describedby={errorId}>
          {Array.from({ length: safeLength }, (_, index) => (
          <input
            key={index}
            ref={index === 0 ? assignFirstRef : (node) => { inputRefs.current[index] = node; }}
            type="text"
            inputMode={mode === "numeric" ? "numeric" : "text"}
            autoComplete="one-time-code"
            autoFocus={autoFocus && index === 0}
            value={otp[index] === " " ? "" : mode === "alphanumeric" ? (otp[index] ?? "").toUpperCase() : otp[index] ?? ""}
            onChange={(event) => handleChange(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onPaste={handlePaste}
            aria-label={`Ký tự ${index + 1} trên ${safeLength}`}
            aria-invalid={error ? true : undefined}
            disabled={disabled}
            maxLength={safeLength}
            className={cn(
              "focus-ring h-14 w-11 rounded-control border border-input bg-muted text-center text-heading font-bold tabular-nums text-foreground disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger focus-visible:ring-danger",
            )}
          />
          ))}
        </div>
        {error && <p id={errorId} className="text-caption font-semibold text-danger">{error}</p>}
      </div>
    );
  },
);
OtpInput.displayName = "OtpInput";
