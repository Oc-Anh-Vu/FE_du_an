import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  tone?: "primary" | "inverse";
  label?: string;
}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = "md", tone = "primary", label = "Đang tải", ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(
        "motion-reduce:animate-none animate-spin",
        size === "sm" ? "size-4" : size === "lg" ? "size-8" : "size-6",
        tone === "inverse" ? "text-primary-foreground" : "text-primary",
        className,
      )}
      role="status"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  ),
);
Spinner.displayName = "Spinner";
