import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface PageSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "surface" | "flat" | "dark";
}

const variantClasses: Record<NonNullable<PageSectionProps["variant"]>, string> = {
  surface: "bg-white rounded-[28px] p-5 md:p-6 border border-[#eadfd8]",
  flat: "bg-transparent p-0",
  dark: "bg-[#3a2c26] text-white rounded-[28px] p-6",
};

export const PageSection = forwardRef<HTMLDivElement, PageSectionProps>(
  (
    {
      className,
      title,
      subtitle,
      action,
      variant = "surface",
      children,
      ...props
    },
    ref
  ) => {
    const isDark = variant === "dark";

    return (
      <section
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {(title || subtitle || action) && (
          <div className="flex items-center justify-between gap-4 mb-4 md:mb-5">
            <div>
              {title && (
                <h2
                  className={cn(
                    "text-[18px] md:text-[20px] font-bold leading-snug",
                    isDark ? "text-white" : "text-[#261b17]"
                  )}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  className={cn(
                    "text-[13px] mt-0.5",
                    isDark ? "text-white/70" : "text-[#756761]"
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </section>
    );
  }
);
PageSection.displayName = "PageSection";
