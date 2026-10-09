import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = "", label, checked, onCheckedChange, id: externalId, onChange, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className={cn("flex items-center justify-between", className)}>
        {label && (
          <label htmlFor={id} className="text-[15px] font-medium text-[#261b17] cursor-pointer">
            {label}
          </label>
        )}
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#f05a32] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f05a32]"></div>
        </div>
      </div>
    );
  }
);
Switch.displayName = "Switch";
