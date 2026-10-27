import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../utils/cn";
import { IconButton } from "../form/IconButton";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

const sizes = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
};

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  initialFocusRef,
  className,
}: ModalProps) => {
  const portalRootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const portalRoot = portalRootRef.current;
    if (!isOpen || !portalRoot) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const siblings = Array.from(document.body.children)
      .filter((child): child is HTMLElement => child instanceof HTMLElement && child !== portalRoot)
      .map((element) => ({ element, inert: element.inert }));

    document.body.style.overflow = "hidden";
    siblings.forEach(({ element }) => { element.inert = true; });

    const dialog = dialogRef.current;
    const preferredFocus = initialFocusRef?.current;
    const firstFocusable = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    const target = preferredFocus && dialog?.contains(preferredFocus) ? preferredFocus : firstFocusable ?? dialog;
    target?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEsc) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      siblings.forEach(({ element, inert }) => { element.inert = inert; });
      previousFocus?.focus();
    };
  }, [isOpen, closeOnEsc, initialFocusRef]);

  return typeof document === "undefined" ? null : createPortal(
    <div ref={portalRootRef} className="contents" data-modal-root="">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              aria-hidden="true"
              className="fixed inset-0 z-modal bg-foreground/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(event) => {
                if (closeOnOverlayClick && event.target === event.currentTarget) onClose();
              }}
            />
            <div className="pointer-events-none fixed inset-0 z-modal flex items-end justify-center sm:items-center">
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className={cn(
                  "pointer-events-auto flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-section border border-border bg-card text-card-foreground shadow-raised sm:rounded-section",
                  sizes[size],
                  className,
                )}
              >
                <header className="flex items-start justify-between gap-4 border-b border-border p-4 md:p-6">
                  <div className="min-w-0">
                    <h2 id={titleId} className="text-heading font-bold text-foreground">{title}</h2>
                    {description && <div id={descriptionId} className="mt-1 text-body-sm text-muted-foreground">{description}</div>}
                  </div>
                  <IconButton variant="ghost" size="lg" aria-label="Đóng" onClick={onClose}>×</IconButton>
                </header>
                <div className="min-h-0 overflow-y-auto p-4 md:p-6">{children}</div>
                {footer && <footer className="border-t border-border bg-muted/50 p-4 md:p-6">{footer}</footer>}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
};
