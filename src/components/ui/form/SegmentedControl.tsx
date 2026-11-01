import { forwardRef, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../utils/cn";
import { useControllableState } from "../../../hooks/useControllableState";

export interface SegmentOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: SegmentOption[];
  "aria-label": string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  layoutId?: string;
}

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ className, options, value, defaultValue, onValueChange, layoutId, id, ...props }, ref) => {
    const generatedId = useId();
    const groupId = id ?? generatedId;
    const enabledOptions = options.filter((option) => !option.disabled);
    const [selectedValue, setSelectedValue] = useControllableState({
      value,
      defaultValue: defaultValue ?? enabledOptions[0]?.value ?? "",
      onChange: onValueChange,
    });

    const handleArrowKey = (event: React.KeyboardEvent<HTMLButtonElement>, optionValue: string) => {
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1
        : 0;
      if (!direction || enabledOptions.length === 0) return;
      event.preventDefault();
      const currentIndex = enabledOptions.findIndex((option) => option.value === optionValue);
      const next = enabledOptions[(currentIndex + direction + enabledOptions.length) % enabledOptions.length];
      setSelectedValue(next.value);
      document.getElementById(`${groupId}-${encodeURIComponent(next.value)}`)?.focus();
    };

    return (
      <div
        ref={ref}
        id={groupId}
        className={cn("relative flex items-center rounded-control bg-muted p-1", className)}
        role="radiogroup"
        {...props}
      >
        {options.map((option) => {
          const isActive = selectedValue === option.value;
          return (
            <button
              key={option.value}
              id={`${groupId}-${encodeURIComponent(option.value)}`}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={option.disabled}
              onClick={() => setSelectedValue(option.value)}
              onKeyDown={(event) => handleArrowKey(event, option.value)}
              className={cn(
                "focus-ring relative z-10 min-h-11 flex-1 rounded-control px-3 py-2 text-body-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              tabIndex={isActive || (!options.some((item) => item.value === selectedValue) && option.value === enabledOptions[0]?.value) ? 0 : -1}
            >
              {isActive && (
                <motion.div
                  layoutId={layoutId ?? `${groupId}-active`}
                  className="absolute inset-0 -z-10 rounded-control bg-card shadow-card"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
);
SegmentedControl.displayName = "SegmentedControl";
