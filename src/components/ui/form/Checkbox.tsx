import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, description, indeterminate, id: externalId, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="flex items-center h-5 mt-0.5">
          <input
            ref={(node) => {
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              if (node) {
                node.indeterminate = indeterminate || false;
              }
            }}
            id={id}
            type="checkbox"
            className="w-5 h-5 rounded border-[#eadfd8] text-[#f05a32] focus:ring-[#f05a32] transition-colors cursor-pointer accent-[#f05a32]"
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label htmlFor={id} className="text-[15px] font-medium text-[#261b17] cursor-pointer leading-5">
                {label}
              </label>
            )}
            {description && (
              <p className="text-[13px] text-[#756761] mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
