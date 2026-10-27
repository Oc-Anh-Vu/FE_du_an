import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import { useControllableState } from "../../../hooks/useControllableState";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'defaultValue'> {
  label?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  formatValue?: (value: number) => string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, value, defaultValue, min = 0, max = 100, step = 1, onValueChange, formatValue, id: externalId, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;
    const [currentValue, setCurrentValue] = useControllableState({
      value,
      defaultValue: defaultValue ?? min,
      onChange: onValueChange,
    });

    return (
      <div className={cn("flex w-full flex-col gap-2", className)}>
        <div className="flex justify-between items-center">
          {label && (
            <label htmlFor={id} className="text-body-sm font-semibold text-foreground">
              {label}
            </label>
          )}
          <span className="text-body-sm font-semibold text-primary-strong">{formatValue ? formatValue(currentValue) : currentValue}</span>
        </div>
        <div className="relative flex h-11 items-center">
          <input
            ref={ref}
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={(event) => setCurrentValue(Number(event.currentTarget.value))}
            aria-valuetext={formatValue?.(currentValue)}
            className="focus-ring relative z-10 h-11 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
        </div>
      </div>
    );
  }
);
Slider.displayName = "Slider";
