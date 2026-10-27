import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  centered?: boolean;
  padded?: boolean;
}

const maxWidthMap: Record<NonNullable<PageContainerProps["maxWidth"]>, string> = {
  sm: "max-w-md mx-auto w-full",
  md: "max-w-xl mx-auto w-full",
  lg: "max-w-4xl mx-auto w-full",
  xl: "max-w-6xl mx-auto w-full",
  "2xl": "max-w-7xl mx-auto w-full",
  full: "w-full",
};

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      className,
      maxWidth = "xl",
      centered = false,
      padded = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto flex min-h-full w-full flex-col gap-6 text-foreground md:gap-8",
          padded && "px-4 py-6 md:px-8 md:py-8",
          centered && "items-center justify-center",
          maxWidthMap[maxWidth],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContainer.displayName = "PageContainer";
