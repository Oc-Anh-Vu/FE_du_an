import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  centered?: boolean;
  padded?: boolean;
}

const maxWidthMap: Record<NonNullable<PageContainerProps["maxWidth"]>, string> = {
  sm: "max-w-md mx-auto w-full",
  md: "max-w-lg mx-auto w-full",
  lg: "max-w-3xl mx-auto w-full",
  xl: "max-w-6xl mx-auto w-full",
  full: "w-full",
};

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      className,
      maxWidth = "full",
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
          "flex flex-col gap-6 bg-[#fff8f1] min-h-full font-sans text-[#261b17]",
          padded && "p-4 md:p-8",
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
