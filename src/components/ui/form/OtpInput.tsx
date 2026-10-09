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
  ({ length = 6, value = "", onChange, mode = "numeric", className }, ref) => {
    const [otp, setOtp] = useState<string[]>(value.split("").slice(0, length));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      if (value.length <= length) {
        setOtp(value.padEnd(length, " ").split(""));
      }
    }, [value, length]);

    const focusInput = (index: number) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index]?.focus();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const val = e.target.value;
      
      let valid = false;
      if (mode === "numeric") {
        valid = /^[0-9]+$/.test(val);
      } else {
        valid = /^[a-zA-Z0-9]+$/.test(val);
      }

      if (!valid && val !== "") return;

      const newOtp = [...otp];
      newOtp[index] = val.substring(val.length - 1);
      setOtp(newOtp);
      
      const newString = newOtp.join("").trim();
      onChange?.(newString);

      if (val !== "" && index < length - 1) {
        focusInput(index + 1);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace") {
        if (!otp[index] && index > 0) {
          focusInput(index - 1);
        } else {
          const newOtp = [...otp];
          newOtp[index] = "";
          setOtp(newOtp);
          onChange?.(newOtp.join("").trim());
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        focusInput(index - 1);
      } else if (e.key === "ArrowRight" && index < length - 1) {
        focusInput(index + 1);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text/plain").trim();
      if (!pastedData) return;

      const pastedChars = pastedData.split("").slice(0, length);
      const newOtp = [...otp];
      
      let validStr = "";
      for (let i = 0; i < pastedChars.length; i++) {
        if (mode === "numeric" && /^[0-9]$/.test(pastedChars[i])) {
          newOtp[i] = pastedChars[i];
          validStr += pastedChars[i];
        } else if (mode === "alphanumeric" && /^[a-zA-Z0-9]$/.test(pastedChars[i])) {
          newOtp[i] = pastedChars[i];
          validStr += pastedChars[i];
        }
      }

      setOtp(newOtp);
      onChange?.(newOtp.join("").trim());
      
      const nextIndex = Math.min(validStr.length, length - 1);
      focusInput(nextIndex);
    };

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type={mode === "numeric" ? "tel" : "text"}
            inputMode={mode === "numeric" ? "numeric" : "text"}
            value={otp[index] && otp[index] !== " " ? otp[index] : ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-[24px] font-bold bg-[#f8f6f5] border border-transparent rounded-xl text-[#261b17] focus-visible:border-[#f05a32] focus-visible:bg-white outline-none transition-all"
            maxLength={2}
          />
        ))}
      </div>
    );
  }
);
OtpInput.displayName = "OtpInput";
