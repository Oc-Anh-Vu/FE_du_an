import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  initials?: string;
  color?: string; // e.g. "bg-blue-500"
  isOnline?: boolean;
  ring?: "none" | "ready" | "idle";
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = "", src, alt, size = "md", initials, color = "bg-gray-300", isOnline, ring = "none", ...props }, ref) => {
    const sizes = {
      sm: "size-8 text-xs",
      md: "size-10 text-[13px]",
      lg: "size-14 text-base",
      xl: "size-20 text-xl",
    };

    const onlineIndicatorSizes = {
      sm: "size-2.5",
      md: "size-3",
      lg: "size-4",
      xl: "size-5",
    };

    const ringClasses = {
      none: "",
      ready: "ring-2 ring-green-500 ring-offset-2",
      idle: "ring-2 ring-gray-300 ring-offset-2",
    };

    return (
      <div className={cn("relative inline-block shrink-0 rounded-full", ringClasses[ring], className)} ref={ref} {...props}>
        {src ? (
          <img src={src} alt={alt || "Avatar"} className={cn("rounded-full object-cover", sizes[size])} />
        ) : (
          <div className={cn("rounded-full flex items-center justify-center text-white font-bold", sizes[size], color)}>
            {initials}
          </div>
        )}
        
        {isOnline && (
          <span className={cn("absolute bottom-0 right-0 rounded-full border-2 border-white bg-green-500", onlineIndicatorSizes[size])} />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
