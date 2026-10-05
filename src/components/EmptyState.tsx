import { forwardRef } from "react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className = "", title, description, icon, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-[#eadfd8] rounded-3xl ${className}`}
        {...props}
      >
        {icon && <div className="text-[48px] mb-4 opacity-50 grayscale">{icon}</div>}
        <h3 className="text-[18px] font-['Inter:Bold'] font-bold text-[#261b17] mb-2">{title}</h3>
        {description && <p className="text-[#756761] text-[14px] max-w-[280px] mb-6">{description}</p>}
        {action && <div>{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
