import { forwardRef } from "react";
import { Input, type InputProps } from "./Input";
import { formatVND, parseVND } from "../../../utils/currencyFormat";
import { useControllableState } from "../../../hooks/useControllableState";

export interface CurrencyInputProps extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode"> {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  suffix?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, defaultValue = null, onValueChange, suffix = "đ", ...props }, ref) => {
    const [amount, setAmount] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const displayValue = amount === null ? "" : formatVND(amount);

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(event) => {
          const digits = event.currentTarget.value.replace(/[^0-9]/g, "");
          setAmount(digits ? parseVND(digits) : null);
        }}
        rightIcon={suffix ? <span className="text-caption text-muted-foreground">{suffix}</span> : undefined}
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
