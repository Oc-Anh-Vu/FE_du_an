import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "error" | "info" | "default";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", size = "md", dot = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full font-bold gap-1.5";
    
    const sizes = {
      sm: "px-2 py-0.5 text-[10px]",
      md: "px-2.5 py-0.5 text-[12px]",
    };

    const variants = {
      success: "bg-green-100 text-green-700",
      warning: "bg-yellow-100 text-yellow-700",
      error: "bg-red-100 text-red-700",
      info: "bg-blue-100 text-blue-700",
      default: "bg-[#fff8f1] text-[#f05a32]", // Default like the rating badge
    };

    const dotColors = {
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      default: "bg-[#f05a32]",
    };

    return (
      <div ref={ref} className={cn(baseStyles, sizes[size], variants[variant], className)} {...props}>
        {dot && <span className={cn("size-1.5 rounded-full", dotColors[variant])} />}
        {children}
      </div>
    );
  }
);
Badge.displayName = "Badge";
