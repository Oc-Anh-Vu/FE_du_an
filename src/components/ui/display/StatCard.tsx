import { forwardRef } from "react";
import { Card } from "./Card";
import { cn } from "../../../utils/cn";

export interface StatCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "dark" | "danger";
  trend?: React.ReactNode;
}

export const StatCard = forwardRef<HTMLElement, StatCardProps>(
  ({ className, title, value, description, icon, variant = "default", trend, ...props }, ref) => {
    const valueClass = variant === "danger" ? "text-danger-soft-foreground" : variant === "dark" ? "text-surface-dark-foreground" : "text-primary-strong";
    const mutedClass = variant === "dark" ? "text-surface-dark-foreground/70" : "text-muted-foreground";
    return (
      <Card
        ref={ref}
        variant={variant === "dark" ? "dark" : "default"}
        className={cn(variant === "danger" && "border-danger/20 bg-danger-soft", className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className={cn("text-body-sm font-semibold", mutedClass)}>
              {title}
            </h3>
            <div className={cn("text-title tabular-nums md:text-title-lg", valueClass)}>
              {value}
            </div>
            {description && (
              <p className={cn("text-caption", mutedClass)}>
                {description}
              </p>
            )}
            {trend && <div className="text-caption font-semibold">{trend}</div>}
          </div>
          {icon && (
            <div aria-hidden="true" className={cn("rounded-full p-2", variant === "dark" ? "bg-surface-dark-foreground/10" : variant === "danger" ? "bg-danger/10" : "bg-highlight")}>
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
);
StatCard.displayName = "StatCard";
