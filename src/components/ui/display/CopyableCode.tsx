import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";

export interface CopyableCodeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  code: string;
  label?: string;
  onCopied?: () => void;
}

export const CopyableCode = forwardRef<HTMLButtonElement, CopyableCodeProps>(
  ({ className, code, label, onCopied, ...props }, ref) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        onCopied?.();
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    };

    const CopyIcon = (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
    );

    const CheckIcon = (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    );

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        className={cn("flex flex-col items-center gap-1 group", className)}
        {...props}
      >
        {label && <span className="text-[13px] text-[#756761] font-medium">{label}</span>}
        <div className="flex items-center gap-3 bg-[#f8f6f5] hover:bg-[#eadfd8] transition-colors py-2 px-4 rounded-xl border border-transparent focus-visible:border-[#f05a32] outline-none">
          <span className="text-[24px] font-bold text-[#261b17] tracking-widest">{code}</span>
          <div className="text-[#756761] group-hover:text-[#f05a32] transition-colors">
            {copied ? CheckIcon : CopyIcon}
          </div>
        </div>
        <div className={cn("text-[12px] font-bold transition-opacity h-4", copied ? "opacity-100 text-green-500" : "opacity-0")}>
          Đã sao chép ✓
        </div>
      </button>
    );
  }
);
CopyableCode.displayName = "CopyableCode";
