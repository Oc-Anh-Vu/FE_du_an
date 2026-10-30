import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  overline?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  backAction?: React.ReactNode;
  animated?: boolean;
}

export const PageHeader = forwardRef<HTMLHeadingElement, PageHeaderProps>(
  ({ className, overline, title, subtitle, action, backAction, animated = true, ...props }, ref) => {
    const header = (
      <header className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)} {...props}>
        <div className="flex min-w-0 items-start gap-3">
          {backAction && <div className="shrink-0">{backAction}</div>}
          <div className="min-w-0 space-y-1">
            {overline && <p className="text-overline uppercase text-primary-strong">{overline}</p>}
            <h1 ref={ref} tabIndex={-1} className="text-title text-foreground md:text-title-lg">{title}</h1>
            {subtitle && <p className="text-body-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="w-full shrink-0 md:w-auto">{action}</div>}
      </header>
    );
    return animated ? (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {header}
      </motion.div>
    ) : header;
  },
);
PageHeader.displayName = "PageHeader";
