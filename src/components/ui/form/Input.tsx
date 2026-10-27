import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, hint, error, leftIcon, rightSlot, inputSize = "md", id: externalId, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;
    
    const sizes = {
      sm: "h-10 text-[13px] px-3",
      md: "h-12 text-[14px] px-4",
      lg: "h-14 text-[16px] px-4",
    };

    const hasError = !!error;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", className)}>
        {label && (
          <label htmlFor={id} className="text-[14px] font-bold text-[#261b17]">
            {label} {props.required && <span className="text-[#f05a32]">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-[#756761] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-[#f8f6f5] border border-transparent rounded-xl text-[#261b17] placeholder:text-[#a0938d] outline-none transition-all",
              "focus-visible:border-[#f05a32] focus-visible:bg-white disabled:opacity-50 disabled:cursor-not-allowed",
              hasError && "border-red-500 bg-red-50 focus-visible:border-red-500",
              sizes[inputSize],
              leftIcon && "pl-10",
              rightSlot && "pr-12"
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            {...props}
          />
          {rightSlot && (
            <div className="absolute right-3 flex items-center">
              {rightSlot}
            </div>
          )}
        </div>
        {hasError ? (
          <span id={`${id}-error`} className="text-[12px] text-red-500 mt-0.5">{error}</span>
        ) : hint ? (
          <span id={`${id}-hint`} className="text-[12px] text-[#756761] mt-0.5">{hint}</span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
