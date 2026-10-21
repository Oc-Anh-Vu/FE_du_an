import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  overline?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  animated?: boolean;
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      className,
      overline,
      title,
      subtitle,
      action,
      align = "left",
      animated = true,
      ...props
    },
    ref
  ) => {
    const content = (
      <div
        ref={ref}
        className={cn(
          "flex gap-4",
          align === "center"
            ? "flex-col items-center text-center"
            : "flex-col md:flex-row md:items-start md:justify-between",
          className
        )}
        {...props}
      >
        <div className="space-y-1">
          {overline && (
            <p className="text-[#f05a32] text-[13px] font-bold uppercase tracking-wider">
              {overline}
            </p>
          )}
          <h1 className="text-[26px] md:text-[32px] font-bold text-[#261b17] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#756761] text-[15px]">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );

    if (!animated) return content;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {content}
      </motion.div>
    );
  }
);
PageHeader.displayName = "PageHeader";
