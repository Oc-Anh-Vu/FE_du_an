import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";

type CardElement = HTMLElement;

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "highlight" | "dark";
  headerAction?: React.ReactNode;
}

const variants = {
  default: "border border-border bg-card text-card-foreground",
  highlight: "border border-secondary bg-highlight text-highlight-foreground",
  dark: "border border-surface-dark bg-surface-dark text-surface-dark-foreground",
};

const paddings = {
  none: "p-0",
  sm: "p-3",
  md: "p-4 md:p-6",
  lg: "p-6 md:p-8",
};

export const Card = forwardRef<CardElement, CardProps>(
  ({ as = "div", className, title, description, footer, padding = "md", variant = "default", headerAction, children, ...props }, ref) => (
    createElement(
      as,
      {
        ...props,
        ref,
        className: cn("overflow-hidden rounded-card", variants[variant], className),
      },
      <>
        {(title || description || headerAction) && (
          <div className={cn("flex items-start justify-between gap-4 border-b border-border/70", paddings[padding])}>
            <div className="min-w-0">
              {title && <h3 className="text-heading-sm text-current">{title}</h3>}
              {description && <p className="mt-1 text-body-sm text-current/70">{description}</p>}
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}
        <div className={paddings[padding]}>{children}</div>
        {footer && <div className={cn("border-t border-border/70 bg-muted/50", paddings[padding])}>{footer}</div>}
      </>,
    )
  ),
);
Card.displayName = "Card";
