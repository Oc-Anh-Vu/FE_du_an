import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import {
  AVATAR_BG_CLASS,
  getAvatarColor,
  type AvatarColor,
} from "../../../utils/avatarColor";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  initials?: string;
  color?: AvatarColor;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  ring?: "none" | "ready" | "idle";
}

const sizes = {
  sm: "size-8 text-micro",
  md: "size-10 text-caption",
  lg: "size-12 text-body-sm",
  xl: "size-16 text-heading",
};

const ringClasses = {
  none: "",
  ready: "ring-2 ring-success ring-offset-2 ring-offset-card",
  idle: "ring-2 ring-border ring-offset-2 ring-offset-card",
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, initials, color = getAvatarColor(name), size = "md", isOnline = false, ring = "none", ...props }, ref) => {
    const fallbackInitials = initials ?? name.trim().split(/\s+/).slice(-2).map((part) => part[0] ?? "").join("").toUpperCase();

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex shrink-0 rounded-full", ringClasses[ring], className)}
        {...props}
      >
        {src ? (
          <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size])} />
        ) : (
          <span
            aria-label={name}
            className={cn("inline-flex items-center justify-center rounded-full font-bold text-primary-foreground", sizes[size], AVATAR_BG_CLASS[color])}
          >
            {fallbackInitials}
          </span>
        )}
        {isOnline && (
          <>
            <span aria-hidden="true" className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-success" />
            <span className="sr-only">Đang online</span>
          </>
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";
