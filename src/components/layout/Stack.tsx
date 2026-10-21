import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal";
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
}

const gapClasses: Record<NonNullable<StackProps["gap"]>, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};

const alignClasses: Record<NonNullable<StackProps["align"]>, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClasses: Record<NonNullable<StackProps["justify"]>, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = "vertical",
      gap = 4,
      align,
      justify,
      wrap = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          direction === "vertical" ? "flex-col" : "flex-row",
          gapClasses[gap],
          align && alignClasses[align],
          justify && justifyClasses[justify],
          wrap && "flex-wrap",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = "Stack";
