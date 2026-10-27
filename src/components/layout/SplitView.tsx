import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface SplitViewProps extends React.HTMLAttributes<HTMLDivElement> {
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: "equal" | "sidebar-left" | "sidebar-right" | "content-map";
  gap?: 4 | 6 | 8;
}

const gapClasses: Record<NonNullable<SplitViewProps["gap"]>, string> = {
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
};

export const SplitView = forwardRef<HTMLDivElement, SplitViewProps>(
  ({ className, left, right, ratio = "equal", gap = 6, ...props }, ref) => {
    const leftClasses = {
      equal: "flex-1 min-w-0",
      "sidebar-left": "w-full md:w-[340px] lg:w-[380px] shrink-0",
      "sidebar-right": "flex-1 min-w-0",
      "content-map": "flex-1 min-w-0",
    }[ratio];

    const rightClasses = {
      equal: "flex-1 min-w-0",
      "sidebar-left": "flex-1 min-w-0",
      "sidebar-right": "w-full md:w-[340px] lg:w-[360px] shrink-0",
      "content-map": "hidden md:block md:w-1/2 shrink-0 sticky top-6 self-start",
    }[ratio];

    return (
      <div
        ref={ref}
        className={cn("flex flex-col md:flex-row", gapClasses[gap], className)}
        {...props}
      >
        <div className={leftClasses}>{left}</div>
        <div className={rightClasses}>{right}</div>
      </div>
    );
  }
);
SplitView.displayName = "SplitView";
