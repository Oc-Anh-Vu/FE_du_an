import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "dark" | "highlight";
  headerAction?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", title, description, footer, padding = "md", variant = "default", headerAction, children, ...props }, ref) => {
    
    const variants = {
      default: "bg-white border border-[#eadfd8]",
      dark: "bg-[#261b17] border-[#261b17] text-white",
      highlight: "bg-[#fff8f1] border-[#f05a32]",
    };
    
    const paddings = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl overflow-hidden", variants[variant], className)}
        {...props}
      >
        {(title || description || headerAction) && (
          <div className={cn("border-b flex justify-between items-center", paddings[padding], variant === 'dark' ? 'border-gray-700' : 'border-[#eadfd8]')}>
            <div>
              {title && <h3 className={cn("font-bold text-[16px]", variant === 'dark' ? 'text-white' : 'text-[#261b17]')}>{title}</h3>}
              {description && <p className={cn("text-[13px] mt-1", variant === 'dark' ? 'text-gray-400' : 'text-[#756761]')}>{description}</p>}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}
        <div className={paddings[padding]}>{children}</div>
        {footer && <div className={cn("border-t", paddings[padding], variant === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-[#eadfd8] bg-gray-50')}>{footer}</div>}
      </div>
    );
  }
);
Card.displayName = "Card";
