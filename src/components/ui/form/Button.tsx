import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { Spinner } from "../feedback/Spinner";
import { buttonVariants, type ButtonSize, type ButtonVariant } from "./buttonVariants";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, loadingText, fullWidth = false, leftIcon, rightIcon, children, disabled, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        type={type}
        aria-busy={loading || undefined}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {loading ? <Spinner size="sm" tone={variant === "primary" || variant === "danger" ? "inverse" : "primary"} /> : leftIcon}
        {loading && loadingText ? loadingText : children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
