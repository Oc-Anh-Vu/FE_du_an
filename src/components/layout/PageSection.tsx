import { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";

export interface PageSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "surface" | "flat" | "dark";
}

const variantClasses = {
  surface: "rounded-section border border-border bg-card p-5 md:p-8",
  flat: "bg-transparent p-0",
  dark: "rounded-section bg-surface-dark p-5 text-surface-dark-foreground md:p-8",
};

export const PageSection = forwardRef<HTMLElement, PageSectionProps>(
  ({ className, title, subtitle, action, variant = "surface", children, ...props }, ref) => {
    const titleId = useId();
    const isDark = variant === "dark";

    return (
      <section ref={ref} className={cn(variantClasses[variant], className)} aria-labelledby={title ? titleId : undefined} {...props}>
        {(title || subtitle || action) && (
          <header className="mb-4 flex items-start justify-between gap-4 md:mb-5">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className={cn("text-heading font-bold", isDark ? "text-surface-dark-foreground" : "text-foreground")}>
                  {title}
                </h2>
              )}
              {subtitle && <p className={cn("mt-1 text-body-sm", isDark ? "text-surface-dark-foreground/70" : "text-muted-foreground")}>{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </header>
        )}
        {children}
      </section>
    );
  },
);
PageSection.displayName = "PageSection";
