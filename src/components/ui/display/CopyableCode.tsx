import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";

export interface CopyableCodeProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onCopy"> {
  code: string;
  label?: string;
  onCopied?: (code: string) => void;
}

export const CopyableCode = forwardRef<HTMLButtonElement, CopyableCodeProps>(
  ({ className, code, label, onCopied, ...props }, ref) => {
    const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
    const codeRef = useRef<HTMLSpanElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleCopy = async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard API is unavailable");
        await navigator.clipboard.writeText(code);
        setStatus("copied");
        onCopied?.(code);
      } catch {
        const range = document.createRange();
        if (codeRef.current) {
          range.selectNodeContents(codeRef.current);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        setStatus("manual");
      }

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setStatus("idle"), 2000);
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        aria-label={`Sao chép mã ${code}`}
        className={cn("focus-ring inline-flex min-h-11 flex-col items-center gap-1 rounded-control", className)}
        {...props}
      >
        {label && <span className="text-caption font-semibold text-muted-foreground">{label}</span>}
        <span className="inline-flex items-center gap-3 rounded-control border border-border bg-muted px-4 py-2 transition-colors hover:bg-highlight">
          <span ref={codeRef} className="text-heading font-bold tracking-widest text-foreground">{code}</span>
          <span aria-hidden="true" className="text-primary-strong">
            {status === "copied" ? "✓" : "▢"}
          </span>
        </span>
        <span aria-live="polite" className="min-h-5 text-caption font-semibold text-success-soft-foreground">
          {status === "copied" ? "Đã sao chép!" : status === "manual" ? "Đã chọn mã. Nhấn Ctrl+C để sao chép." : ""}
        </span>
      </button>
    );
  },
);
CopyableCode.displayName = "CopyableCode";
