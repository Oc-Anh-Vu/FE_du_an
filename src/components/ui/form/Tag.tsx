import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface TagProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  emoji?: string;
  selected?: boolean;
  size?: "sm" | "md";
}

export const Tag = forwardRef<HTMLButtonElement, TagProps>(
  ({ className = "", label, emoji, selected = false, size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected}
        className={cn(
        "focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-full border font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-2.5 py-1 text-overline" : "px-3 py-1.5 text-body-sm",
          selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40",
          className
        )}
        {...props}
      >
        {emoji && <span aria-hidden="true">{emoji}</span>}
        {label}
      </button>
    );
  }
);
Tag.displayName = "Tag";
