import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, label, checked, defaultChecked = false, onCheckedChange, onClick, id: externalId, disabled, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = checked ?? internalChecked;
    const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(event);
      if (event.defaultPrevented) return;
      const next = !isChecked;
      if (checked === undefined) setInternalChecked(next);
      onCheckedChange?.(next);
    };

    return (
      <div className={cn("inline-flex items-center gap-3", className)}>
        {label && <label htmlFor={id} id={`${id}-label`} className="cursor-pointer text-body-sm font-semibold text-foreground">{label}</label>}
        <button
          {...props}
          ref={ref}
          id={id}
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-labelledby={label ? `${id}-label` : undefined}
          disabled={disabled}
          onClick={toggle}
          className="focus-ring relative inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden="true" className={cn("absolute h-6 w-11 rounded-full transition-colors", isChecked ? "bg-primary" : "bg-border")} />
          <span aria-hidden="true" className={cn("absolute left-2 size-5 rounded-full bg-card shadow-card transition-transform", isChecked && "translate-x-5")} />
        </button>
      </div>
    );
  }
);
Switch.displayName = "Switch";
