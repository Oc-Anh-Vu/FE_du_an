import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  lines?: number; // only applicable for "text"
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", width, height, lines = 1, style, ...props }, ref) => {
    const baseStyle = "bg-gray-200 animate-pulse";
    
    if (variant === "text" && lines > 1) {
      return (
        <div ref={ref} className={cn("space-y-2 w-full", className)} style={{ width, ...style }} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className={cn(baseStyle, "h-4 rounded")}
              style={{ width: i === lines - 1 ? "80%" : "100%" }}
            />
          ))}
        </div>
      );
    }

    const variants = {
      text: "h-4 w-full rounded",
      circle: "rounded-full",
      rect: "rounded-xl",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyle, variants[variant], className)}
        style={{ width, height, ...style }}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";
