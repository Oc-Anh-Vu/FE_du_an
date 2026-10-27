import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../utils/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  color?: string; // e.g. "bg-green-500"
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className = "", value, label, showValue = true, color = "bg-[#f05a32]", animated = false, size = "md", ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    const sizes = {
      sm: "h-2",
      md: "h-3",
      lg: "h-4",
    };

    return (
      <div 
        ref={ref} 
        className={cn("w-full", className)} 
        role="progressbar" 
        aria-valuenow={clampedValue} 
        aria-valuemin={0} 
        aria-valuemax={100}
        {...props}
      >
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] font-bold text-[#261b17]">{label}</span>
            {showValue && <span className="text-[13px] font-bold text-[#756761]">{clampedValue}%</span>}
          </div>
        )}
        <div className={cn("bg-[#fff8f1] border border-[#eadfd8] rounded-full overflow-hidden relative", sizes[size])}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn("absolute top-0 left-0 h-full rounded-full", color, animated && "animate-pulse")}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";
