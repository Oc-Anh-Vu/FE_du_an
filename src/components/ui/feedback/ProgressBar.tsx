import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  label?: string;
  showPercentage?: boolean;
  tone?: "primary" | "success";
  animated?: boolean;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, label, showPercentage = false, tone = "primary", animated = false, ...props }, ref) => {
    const progress = Math.min(100, Math.max(0, value));

    return (
      <div className={cn("w-full", className)} {...props}>
        {(label || showPercentage) && (
          <div className="mb-2 flex items-center justify-between gap-3">
            {label && <span className="text-body-sm font-semibold text-foreground">{label}</span>}
            {showPercentage && <span className="text-caption font-semibold tabular-nums text-muted-foreground">{progress}%</span>}
          </div>
        )}
        <div
          ref={ref}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={label ?? "Tiến độ"}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn("h-full rounded-full", tone === "success" ? "bg-success" : "bg-primary", animated && "transition-all duration-300 motion-reduce:transition-none")}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
