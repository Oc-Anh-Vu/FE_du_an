import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  orientation?: "horizontal" | "vertical";
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, label, orientation = "horizontal", ...props }, ref) => {
    if (orientation === "vertical") {
      if (!label) {
        return <div ref={ref} className={cn("min-h-6 w-px self-stretch bg-border", className)} aria-hidden="true" {...props} />;
      }

      return (
        <div ref={ref} className={cn("flex min-h-6 flex-col items-center gap-2 text-caption text-muted-foreground", className)} role="separator" aria-orientation="vertical" {...props}>
          <span aria-hidden="true" className="w-px flex-1 bg-border" />
          <span>{label}</span>
          <span aria-hidden="true" className="w-px flex-1 bg-border" />
        </div>
      );
    }

    if (!label) {
      return <div ref={ref} className={cn("h-px w-full bg-border", className)} aria-hidden="true" {...props} />;
    }

    return (
      <div
        ref={ref}
        className={cn("flex w-full items-center gap-3 text-caption text-muted-foreground", className)}
        role="separator"
        aria-orientation="horizontal"
        {...props}
      >
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span>{label}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
    );
  },
);
Divider.displayName = "Divider";
