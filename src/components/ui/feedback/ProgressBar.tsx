import { forwardRef } from "react";
import { motion } from "framer-motion";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  label?: string;
  color?: string; // e.g. "bg-green-500"
  animated?: boolean;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className = "", value, label, color = "bg-[#f05a32]", animated = false, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {label && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] font-bold text-[#261b17]">{label}</span>
            <span className="text-[13px] font-bold text-[#756761]">{clampedValue}%</span>
          </div>
        )}
        <div className="h-3 bg-[#fff8f1] border border-[#eadfd8] rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-full ${color} rounded-full ${animated ? "animate-pulse" : ""}`}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";
