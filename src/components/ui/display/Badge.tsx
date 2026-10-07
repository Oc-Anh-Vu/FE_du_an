import { forwardRef } from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "error" | "info" | "default";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold";
    
    const variants = {
      success: "bg-green-100 text-green-700",
      warning: "bg-yellow-100 text-yellow-700",
      error: "bg-red-100 text-red-700",
      info: "bg-blue-100 text-blue-700",
      default: "bg-[#fff8f1] text-[#f05a32]", // Default like the rating badge
    };

    return (
      <div ref={ref} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
Badge.displayName = "Badge";
