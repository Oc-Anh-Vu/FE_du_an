import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { IconButton } from "../form/IconButton";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "danger" | "info";
  title?: string;
  action?: React.ReactNode;
  onClose?: () => void;
}

const variants = {
  success: "border-success/20 bg-success-soft text-success-soft-foreground",
  warning: "border-warning/20 bg-warning-soft text-warning-soft-foreground",
  danger: "border-danger/20 bg-danger-soft text-danger-soft-foreground",
  info: "border-info/20 bg-info-soft text-info-soft-foreground",
};

const icons = {
  success: "✓",
  warning: "!",
  danger: "×",
  info: "i",
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", title, children, action, onClose, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-start gap-3 rounded-card border p-4", variants[variant], className)} {...props}>
      <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-caption font-bold">
        {icons[variant]}
      </span>
      <div className="min-w-0 flex-1">
        {title && <h3 className="mb-1 text-body-sm font-bold">{title}</h3>}
        <div className="text-body-sm">{children}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onClose && (
        <IconButton variant="ghost" size="sm" aria-label="Đóng thông báo" onClick={onClose}>
          ×
        </IconButton>
      )}
    </div>
  ),
);
Alert.displayName = "Alert";
