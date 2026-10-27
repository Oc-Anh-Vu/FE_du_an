import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  titleAs?: "h2" | "h3" | "h4";
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, title, description, icon, action, size = "md", titleAs = "h3", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center border border-dashed border-border bg-card text-center",
        size === "sm" ? "rounded-card p-4" : size === "lg" ? "rounded-section p-8 md:p-10" : "rounded-panel p-6 md:p-8",
        className,
      )}
      {...props}
    >
      {icon && <div aria-hidden="true" className={cn("mb-3 text-primary-strong", size === "sm" ? "text-heading" : "text-title")}>{icon}</div>}
      {createElement(titleAs, { className: cn("font-bold text-foreground", size === "sm" ? "text-body" : size === "lg" ? "text-heading" : "text-heading-sm") }, title)}
      {description && <p className={cn("mt-2 max-w-prose text-muted-foreground", size === "sm" ? "text-caption" : "text-body-sm")}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";
