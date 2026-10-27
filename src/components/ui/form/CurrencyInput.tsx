import { forwardRef, useEffect, useState } from "react";
import { Input, type InputProps } from "./Input";
import { formatVND, parseVND } from "../../../utils/currencyFormat";

export interface CurrencyInputProps extends Omit<InputProps, "value" | "onChange"> {
  value?: number | null;
  onValueChange?: (value: number | null) => void;
  suffix?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, suffix = "đ", ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      if (value !== undefined && value !== null) {
        setDisplayValue(formatVND(value));
      } else if (value === null) {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const numValue = parseVND(rawValue);

      if (rawValue === "") {
        setDisplayValue("");
        onValueChange?.(null);
        return;
      }

      if (!isNaN(numValue)) {
        setDisplayValue(formatVND(numValue));
        onValueChange?.(numValue);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        rightSlot={suffix ? <span className="text-[#756761] text-[14px]">{suffix}</span> : undefined}
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
