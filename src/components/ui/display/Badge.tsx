import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  dot?: boolean;
}

const variants = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success-soft text-success-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  danger: "bg-danger-soft text-danger-soft-foreground",
  info: "bg-info-soft text-info-soft-foreground",
};

const dots = {
  default: "bg-secondary-foreground",
  success: "bg-success-soft-foreground",
  warning: "bg-warning-soft-foreground",
  danger: "bg-danger-soft-foreground",
  info: "bg-info-soft-foreground",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot = false, children, ...props }, ref) => (
    <span ref={ref} className={cn("inline-flex items-center gap-1.5 rounded-full font-bold", size === "sm" ? "px-2 py-0.5 text-micro" : "px-2.5 py-0.5 text-caption", variants[variant], className)} {...props}>
      {dot && <span aria-hidden="true" className={cn("size-1.5 rounded-full", dots[variant])} />}
      {children}
    </span>
  ),
);
Badge.displayName = "Badge";
