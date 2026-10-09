import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: string[];
  current: number; // 0-indexed
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ className, steps, current, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full pb-8", className)} {...props}>
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#eadfd8] z-0 rounded-full" />
          
          {/* Active line */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#f05a32] z-0 rounded-full transition-all duration-500" 
            style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => {
            const isActive = index <= current;
            const isCurrent = index === current;
            return (
              <div key={index} className="flex flex-col items-center gap-2 z-10 relative">
                <div 
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center text-[14px] font-bold transition-colors duration-300 border-2",
                    isActive 
                      ? "bg-[#f05a32] border-[#f05a32] text-white" 
                      : "bg-white border-[#eadfd8] text-[#a0938d]",
                    isCurrent && "ring-4 ring-[#ffe0d3]"
                  )}
                >
                  {index + 1}
                </div>
                <span className={cn(
                  "text-[12px] absolute top-10 w-24 text-center font-medium",
                  isActive ? "text-[#261b17]" : "text-[#a0938d]"
                )}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
Stepper.displayName = "Stepper";
