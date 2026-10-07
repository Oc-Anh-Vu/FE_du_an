import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

export const Modal = ({ isOpen, onClose, title, children, size = "md" }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    full: "max-w-full m-4",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} pointer-events-auto overflow-hidden flex flex-col max-h-full border border-[#eadfd8]`}
            >
              {title && (
                <div className="flex items-center justify-between p-5 border-b border-[#eadfd8]">
                  <h2 className="text-[18px] font-['Inter:Bold'] font-bold text-[#261b17]">{title}</h2>
                  <button 
                    onClick={onClose}
                    className="size-8 flex items-center justify-center rounded-full bg-[#fff8f1] hover:bg-[#ffe0d3] text-[#f05a32] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="p-5 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
