import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface SplitViewProps extends React.HTMLAttributes<HTMLDivElement> {
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: "equal" | "sidebar-left" | "sidebar-right";
  gap?: 4 | 6 | 8;
  mobileOrder?: "left-first" | "right-first";
}

const gapClasses = {
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
};

export const SplitView = forwardRef<HTMLDivElement, SplitViewProps>(
  ({ className, left, right, ratio = "equal", gap = 6, mobileOrder = "left-first", ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col lg:flex-row", gapClasses[gap], className)} {...props}>
      <div className={cn("min-w-0", mobileOrder === "right-first" && "order-2 lg:order-1", ratio === "equal" && "flex-1", ratio === "sidebar-left" && "lg:w-1/3 lg:shrink-0", ratio === "sidebar-right" && "flex-1")}>
        {left}
      </div>
      <div className={cn("min-w-0", mobileOrder === "right-first" && "order-1 lg:order-2", ratio === "equal" && "flex-1", ratio === "sidebar-left" && "flex-1", ratio === "sidebar-right" && "lg:w-1/3 lg:shrink-0")}>
        {right}
      </div>
    </div>
  ),
);
SplitView.displayName = "SplitView";
