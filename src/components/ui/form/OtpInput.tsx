import { forwardRef, useRef, useState, useEffect } from "react";
import { cn } from "../../../utils/cn";

export interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  mode?: "numeric" | "alphanumeric";
  className?: string;
}

export const OtpInput = forwardRef<HTMLDivElement, OtpInputProps>(
  ({ length = 6, value, onChange, mode = "numeric", className }, ref) => {
    const [otp, setOtp] = useState<string[]>(() =>
      Array.from({ length }, (_, i) => value?.[i] ?? "")
    );
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      if (value !== undefined) {
        setOtp(Array.from({ length }, (_, i) => value[i] ?? ""));
      }
    }, [value, length]);

    const focusInput = (index: number) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index]?.focus();
      }
    };

    const isValidChar = (char: string) => {
      if (mode === "numeric") return /^[0-9]$/.test(char);
      return /^[a-zA-Z0-9]$/.test(char);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const val = e.target.value;

      if (val === "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
        return;
      }

      // Khi ô đã có sẵn ký tự và người dùng gõ đè ký tự mới (con trỏ có thể ở đầu hoặc cuối)
      const currentChar = otp[index] || "";
      let nextChar = val[val.length - 1];
      if (val.length > 1 && nextChar === currentChar) {
        nextChar = val[0];
      }

      if (!isValidChar(nextChar)) return;

      const normalizedChar = mode === "alphanumeric" ? nextChar.toUpperCase() : nextChar;
      const newOtp = [...otp];
      newOtp[index] = normalizedChar;
      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      if (index < length - 1) {
        focusInput(index + 1);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const newOtp = [...otp];
        if (newOtp[index]) {
          newOtp[index] = "";
          setOtp(newOtp);
          onChange?.(newOtp.join(""));
        } else if (index > 0) {
          newOtp[index - 1] = "";
          setOtp(newOtp);
          onChange?.(newOtp.join(""));
          focusInput(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        focusInput(index - 1);
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        focusInput(index + 1);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text/plain").trim();
      if (!pastedData) return;

      const chars = pastedData.split("").filter(isValidChar).slice(0, length);
      if (chars.length === 0) return;

      const newOtp = [...otp];
      chars.forEach((ch, idx) => {
        newOtp[idx] = mode === "alphanumeric" ? ch.toUpperCase() : ch;
      });

      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      const nextIndex = Math.min(chars.length, length - 1);
      focusInput(nextIndex);
    };

    return (
      <div ref={ref} className={cn("flex items-center gap-2 flex-wrap", className)}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type={mode === "numeric" ? "tel" : "text"}
            inputMode={mode === "numeric" ? "numeric" : "text"}
            value={otp[index] || ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            aria-label={`Ô mã xác nhận thứ ${index + 1}`}
            className="w-11 sm:w-12 h-14 text-center text-[22px] sm:text-[24px] font-bold bg-[#f8f6f5] border border-[#eadfd8] rounded-xl text-[#261b17] focus-visible:border-[#f05a32] focus-visible:bg-white outline-none transition-all"
            maxLength={2}
          />
        ))}
      </div>
    );
  }
);
OtpInput.displayName = "OtpInput";
