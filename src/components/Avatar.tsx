import { forwardRef } from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  initials?: string;
  color?: string; // e.g. "bg-blue-500"
  isOnline?: boolean;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = "", src, alt, size = "md", initials, color = "bg-gray-300", isOnline, ...props }, ref) => {
    const sizes = {
      sm: "size-8 text-xs",
      md: "size-10 text-[13px]",
      lg: "size-14 text-base",
    };

    const onlineIndicatorSizes = {
      sm: "size-2.5",
      md: "size-3",
      lg: "size-4",
    };

    return (
      <div className={`relative inline-block shrink-0 ${className}`} ref={ref} {...props}>
        {src ? (
          <img src={src} alt={alt || "Avatar"} className={`${sizes[size]} rounded-full object-cover`} />
        ) : (
          <div className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold ${color}`}>
            {initials}
          </div>
        )}
        
        {isOnline && (
          <span className={`absolute bottom-0 right-0 rounded-full border-2 border-white bg-green-500 ${onlineIndicatorSizes[size]}`} />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
