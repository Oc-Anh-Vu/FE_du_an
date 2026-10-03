import { forwardRef } from "react";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "current";
}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className = "", size = "md", color = "primary", ...props }, ref) => {
    const sizes = {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
    };

    const colors = {
      primary: "text-[#f05a32]",
      white: "text-white",
      current: "text-current",
    };

    return (
      <svg
        ref={ref}
        className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
  }
);
Spinner.displayName = "Spinner";
