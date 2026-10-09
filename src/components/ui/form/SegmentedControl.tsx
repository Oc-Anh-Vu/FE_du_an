import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../utils/cn";

export interface SegmentOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  layoutId?: string;
}

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ className = "", options, value, onChange, layoutId = "segment", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-1 bg-[#f8f6f5] rounded-xl relative", className)}
        role="radiogroup"
        {...props}
      >
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex-1 relative py-2 text-[14px] font-bold rounded-lg transition-colors z-10 outline-none focus-visible:ring-2 focus-visible:ring-[#f05a32]",
                isActive ? "text-[#261b17]" : "text-[#756761] hover:text-[#261b17]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-0 bg-white shadow-sm rounded-lg -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
);
SegmentedControl.displayName = "SegmentedControl";
