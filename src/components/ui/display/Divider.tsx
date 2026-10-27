import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  orientation?: "horizontal" | "vertical";
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, label, orientation = "horizontal", ...props }, ref) => {
    
    if (orientation === "vertical") {
      return (
        <div 
          ref={ref} 
          className={cn("w-px bg-[#eadfd8] h-full min-h-[1em]", className)} 
          role="separator" 
          aria-orientation="vertical"
          {...props}
        />
      );
    }

    return (
      <div ref={ref} className={cn("w-full flex items-center", className)} role="separator" aria-orientation="horizontal" {...props}>
        <div className="flex-1 h-px bg-[#eadfd8]" />
        {label && (
          <span className="px-3 text-[13px] text-[#756761] font-medium bg-transparent">
            {label}
          </span>
        )}
        <div className="flex-1 h-px bg-[#eadfd8]" />
      </div>
    );
  }
);
Divider.displayName = "Divider";
