import { forwardRef } from "react";

export interface TagProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  emoji?: string;
  selected?: boolean;
}

export const Tag = forwardRef<HTMLButtonElement, TagProps>(
  ({ className = "", label, emoji, selected = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] font-bold transition-colors border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          selected
            ? "bg-[#ffe0d3] border-[#f05a32] text-[#c63d1c]"
            : "bg-white border-[#eadfd8] text-[#756761] hover:bg-gray-50"
        } ${className}`}
        {...props}
      >
        {emoji && <span>{emoji}</span>}
        {label}
      </button>
    );
  }
);
Tag.displayName = "Tag";
