import { createElement, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  smCols?: 1 | 2 | 3 | 4 | 5 | 6;
  mdCols?: 1 | 2 | 3 | 4 | 5 | 6;
  lgCols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

const baseCols = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6",
} as const;
const smColsMap = {
  1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6",
} as const;
const mdColsMap = {
  1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6",
} as const;
const lgColsMap = {
  1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6",
} as const;

const gapMap: Record<NonNullable<GridProps["gap"]>, string> = {
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
};

export const Grid = forwardRef<HTMLElement, GridProps>(
  ({ className, cols = 1, smCols, mdCols, lgCols, gap = 4, as = "div", children, ...props }, ref) => {
    return (
      createElement(
        as,
        {
          ...props,
          ref,
          className: cn("grid", baseCols[cols], smCols && smColsMap[smCols], mdCols && mdColsMap[mdCols], lgCols && lgColsMap[lgCols], gapMap[gap], className),
        },
        children,
      )
    );
  }
);
Grid.displayName = "Grid";
