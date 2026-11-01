import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../utils/cn";
import { IconButton } from "../form/IconButton";

export interface ToastProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> {
  message: string;
  type?: "success" | "warning" | "danger" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
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

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className, message, type = "info", onClose, isVisible, duration, ...props }, ref) => {
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const paused = hovered || focused;
    const closeRef = useRef(onClose);
    closeRef.current = onClose;
    const timeout = duration ?? (type === "warning" || type === "danger" ? 5000 : 3000);

    useEffect(() => {
      if (!isVisible || paused) return;
      const timer = setTimeout(() => closeRef.current(), timeout);
      return () => clearTimeout(timer);
    }, [isVisible, paused, timeout]);

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            role={type === "warning" || type === "danger" ? "alert" : "status"}
            aria-live={type === "warning" || type === "danger" ? "assertive" : "polite"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
            }}
            className={cn("z-toast flex items-center gap-3 rounded-card border px-4 py-3 shadow-raised", variants[type], className)}
            {...props}
          >
            <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-caption font-bold">{icons[type]}</span>
            <span className="min-w-0 flex-1 text-body-sm font-semibold">{message}</span>
            <IconButton variant="ghost" size="sm" aria-label="Đóng thông báo" onClick={onClose}>
              ×
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
Toast.displayName = "Toast";
