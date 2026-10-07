import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  size?: "sm" | "md";
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className = "", title, description, icon, action, size = "md", ...props }, ref) => {
    const sizes = {
      sm: "p-4 rounded-2xl",
      md: "p-8 rounded-3xl",
    };

    const iconSizes = {
      sm: "text-[32px] mb-2",
      md: "text-[48px] mb-4",
    };

    const titleSizes = {
      sm: "text-[15px] mb-1",
      md: "text-[18px] mb-2",
    };
    
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center text-center bg-white border border-dashed border-[#eadfd8]", sizes[size], className)}
        {...props}
      >
        {icon && <div className={cn("opacity-50 grayscale", iconSizes[size])}>{icon}</div>}
        <h3 className={cn("font-bold text-[#261b17]", titleSizes[size])}>{title}</h3>
        {description && <p className={cn("text-[#756761] max-w-[280px]", size === "sm" ? "text-[13px] mb-4" : "text-[14px] mb-6")}>{description}</p>}
        {action && <div>{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
