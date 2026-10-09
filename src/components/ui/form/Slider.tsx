import { forwardRef, useId, useState, useEffect } from "react";
import { cn } from "../../../utils/cn";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  formatValue?: (value: number) => string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className = "", label, value, min = 0, max = 100, step = 1, onChange, formatValue, id: externalId, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;
    
    // Controlled vs Uncontrolled
    const [localValue, setLocalValue] = useState<number>(value ?? min);

    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      if (value === undefined) {
        setLocalValue(newValue);
      }
      onChange?.(newValue);
    };

    const percentage = ((localValue - min) / (max - min)) * 100;

    return (
      <div className={cn("flex flex-col gap-2 w-full", className)}>
        <div className="flex justify-between items-center">
          {label && (
            <label htmlFor={id} className="text-[14px] font-bold text-[#261b17]">
              {label}
            </label>
          )}
          <span className="text-[14px] font-medium text-[#f05a32]">
            {formatValue ? formatValue(localValue) : localValue}
          </span>
        </div>
        <div className="relative flex items-center h-5">
          <input
            ref={ref}
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleChange}
            className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
            {...props}
          />
          {/* Custom Track */}
          <div className="w-full h-1.5 bg-[#eadfd8] rounded-full overflow-hidden z-0">
            <div 
              className="h-full bg-[#f05a32]" 
              style={{ width: `${percentage}%` }}
            />
          </div>
          {/* Custom Thumb */}
          <div 
            className="absolute size-5 bg-white border-2 border-[#f05a32] rounded-full shadow z-10 pointer-events-none transition-transform"
            style={{ left: `calc(${percentage}% - 10px)` }}
          />
        </div>
      </div>
    );
  }
);
Slider.displayName = "Slider";
