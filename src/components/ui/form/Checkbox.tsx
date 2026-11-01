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
        <div className="mt-0.5 flex h-5 items-center">
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
            aria-describedby={description ? `${id}-description` : undefined}
            className="focus-ring size-5 cursor-pointer rounded border-input text-primary accent-primary disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label htmlFor={id} className="cursor-pointer text-body font-semibold text-foreground">
                {label}
              </label>
            )}
            {description && (
              <p id={`${id}-description`} className="mt-0.5 text-caption text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
