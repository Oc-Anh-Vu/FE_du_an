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
  ({ className, variant = "ghost", size = "md", loading = false, children, disabled, type = "button", ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
      outline: "border-2 border-primary text-primary-strong hover:bg-secondary",
      ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
      danger: "bg-danger text-danger-foreground hover:bg-danger-hover",
    };

    const sizes = {
      sm: "size-8",
      md: "size-10",
      lg: "size-12",
      xl: "size-16",
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-busy={loading || undefined}
        className={cn("focus-ring inline-flex shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" tone={variant === "primary" || variant === "danger" ? "inverse" : "primary"} />
        ) : (
          <span aria-hidden="true">{children}</span>
        )}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
