import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  isVisible?: boolean; // Cho phép điều khiển hiển thị
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className = "", message, type = "info", onClose, isVisible = true, ...props }, ref) => {
    const types = {
      success: "bg-green-100 text-green-800 border-green-200",
      error: "bg-red-100 text-red-800 border-red-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const icons = {
      success: "✅",
      error: "❌",
      info: "ℹ️",
    };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm ${types[type]} ${className}`}
            {...props}
          >
            <span>{icons[type]}</span>
            <span className="font-bold text-[14px]">{message}</span>
            {onClose && (
              <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100">
                ✕
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
Toast.displayName = "Toast";
