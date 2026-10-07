import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  closeOnBackdrop?: boolean;
}

export const Modal = ({ isOpen, onClose, title, children, footer, size = "md", closeOnBackdrop = true }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKeyDown);
      
      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    full: "max-w-full m-4",
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeOnBackdrop && onClose()}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn("bg-white rounded-3xl shadow-2xl w-full pointer-events-auto overflow-hidden flex flex-col max-h-full border border-[#eadfd8]", sizes[size])}
            >
              {title && (
                <div className="flex items-center justify-between p-5 border-b border-[#eadfd8]">
                  <h2 className="text-[18px] font-bold text-[#261b17]">{title}</h2>
                  <button 
                    onClick={onClose}
                    aria-label="Đóng"
                    className="size-8 flex items-center justify-center rounded-full bg-[#fff8f1] hover:bg-[#ffe0d3] text-[#f05a32] transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="p-5 overflow-y-auto">
                {children}
              </div>
              {footer && (
                <div className="p-5 border-t border-[#eadfd8] bg-gray-50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};
