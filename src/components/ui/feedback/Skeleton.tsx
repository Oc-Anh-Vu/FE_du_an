import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", width, height, lines = 1, style, ...props }, ref) => {
    if (variant === "text" && lines > 1) {
      return (
        <div ref={ref} className={cn("w-full space-y-2", className)} style={{ width, ...style }} aria-hidden="true" {...props}>
          {Array.from({ length: lines }, (_, index) => (
            <div key={index} className="motion-reduce:animate-none h-4 rounded-control bg-muted animate-pulse" style={{ width: index === lines - 1 ? "80%" : "100%" }} />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "motion-reduce:animate-none bg-muted animate-pulse",
          variant === "text" && "h-4 w-full rounded-control",
          variant === "circle" && "rounded-full",
          variant === "rect" && "rounded-card",
          className,
        )}
        style={{ width, height, ...style }}
        aria-hidden="true"
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";
