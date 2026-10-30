import { forwardRef } from "react";
import { Avatar } from "./Avatar";
import { cn } from "../../../utils/cn";
import { getAvatarColor, type AvatarColor } from "../../../utils/avatarColor";

export interface UserItem {
  id: string;
  name: string;
  avatarUrl?: string;
  color?: AvatarColor;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  users: UserItem[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, users, max = 4, size = "md", ...props }, ref) => {
    const visibleUsers = users.slice(0, max);
    const overflowCount = Math.max(0, users.length - max);

    return (
      <div ref={ref} className={cn("flex items-center -space-x-3", className)} {...props}>
        {visibleUsers.map((user) => (
          <div key={user.id} className="relative z-10 rounded-full ring-2 ring-card">
            <Avatar
              size={size}
              src={user.avatarUrl}
              name={user.name}
              color={user.color ?? getAvatarColor(user.id)}
            />
          </div>
        ))}
        {overflowCount > 0 && (
          <div
            role="img"
            aria-label={`và ${overflowCount} người khác`}
            className={cn(
              "relative z-0 flex items-center justify-center rounded-full bg-muted font-bold text-muted-foreground ring-2 ring-card",
              size === "sm" && "size-8 text-micro",
              size === "md" && "size-10 text-caption",
              size === "lg" && "size-12 text-body-sm",
            )}
          >
            +{overflowCount}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";
