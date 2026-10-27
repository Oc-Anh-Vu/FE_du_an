import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { Spinner } from "../feedback/Spinner";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  "aria-label": string; // bắt buộc
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = "", variant = "ghost", size = "md", loading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05a32] disabled:opacity-50 disabled:pointer-events-none cursor-pointer shrink-0";
    
    const variants = {
      primary: "bg-[#f05a32] text-white hover:bg-[#c63d1c]",
      secondary: "bg-[#ffe0d3] text-[#c63d1c] hover:bg-[#ffeed3]",
      outline: "border-2 border-[#eadfd8] text-[#756761] hover:bg-gray-50",
      ghost: "bg-transparent text-[#756761] hover:bg-gray-100",
      danger: "bg-red-50 text-red-500 hover:bg-red-100",
    };

    const sizes = {
      sm: "size-8 text-[16px]",
      md: "size-10 text-[20px]",
      lg: "size-12 text-[24px]",
      xl: "size-14 text-[28px]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" color={variant === 'primary' ? 'white' : 'primary'} />
        ) : (
          children
        )}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
