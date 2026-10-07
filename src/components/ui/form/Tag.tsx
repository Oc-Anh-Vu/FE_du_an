import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface TagProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  emoji?: string;
  selected?: boolean;
  size?: "sm" | "md";
}

export const Tag = forwardRef<HTMLButtonElement, TagProps>(
  ({ className = "", label, emoji, selected = false, size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-pressed={selected}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-bold transition-colors border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          size === "sm" ? "px-2.5 py-1 text-[12px]" : "px-3 py-1.5 text-[14px]",
          selected
            ? "bg-[#ffe0d3] border-[#f05a32] text-[#c63d1c]"
            : "bg-white border-[#eadfd8] text-[#756761] hover:bg-gray-50",
          className
        )}
        {...props}
      >
        {emoji && <span>{emoji}</span>}
        {label}
      </button>
    );
  }
);
Tag.displayName = "Tag";
