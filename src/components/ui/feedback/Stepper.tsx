import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface StepperProps extends React.HTMLAttributes<HTMLOListElement> {
  steps: string[];
  current: number;
}

export const Stepper = forwardRef<HTMLOListElement, StepperProps>(
  ({ className, steps, current, ...props }, ref) => {
    const activeStep = Math.min(Math.max(current, 0), Math.max(steps.length - 1, 0));
    const progress = steps.length > 1 ? (activeStep / (steps.length - 1)) * 100 : 100;

    return (
      <ol ref={ref} className={cn("relative flex w-full items-start justify-between gap-2 pb-8", className)} {...props}>
        <span aria-hidden="true" className="absolute left-0 right-0 top-4 h-1 rounded-full bg-border" />
        <span aria-hidden="true" className="absolute left-0 top-4 h-1 rounded-full bg-primary transition-all duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        {steps.map((step, index) => {
          const isComplete = index < activeStep;
          const isCurrent = index === activeStep;
          return (
            <li key={`${step}-${index}`} aria-current={isCurrent ? "step" : undefined} className="relative z-10 flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
              <span className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 text-caption font-bold",
                isComplete || isCurrent ? "border-primary bg-primary-hover text-primary-foreground" : "border-border bg-card text-muted-foreground",
                isCurrent && "ring-4 ring-secondary",
              )}>
                {index + 1}
              </span>
              <span className={cn("w-full text-micro", isCurrent ? "font-bold text-foreground" : "text-muted-foreground")}>
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    );
  },
);
Stepper.displayName = "Stepper";
