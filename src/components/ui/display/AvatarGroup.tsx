import { forwardRef } from "react";
import { Avatar, type AvatarProps } from "./Avatar";
import { cn } from "../../../utils/cn";

export interface UserItem {
  id: string;
  name: string;
  avatarUrl?: string;
  color?: string;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  users: UserItem[];
  max?: number;
  size?: AvatarProps['size'];
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, users, max = 4, size = "md", ...props }, ref) => {
    const visibleUsers = users.slice(0, max);
    const overflowCount = Math.max(0, users.length - max);

    const sizeClasses = {
      sm: "size-8 text-[11px]",
      md: "size-10 text-[13px]",
      lg: "size-12 text-[15px]",
      xl: "size-16 text-[18px]",
    };

    const getInitials = (name: string) => {
      return name.trim().split(/\s+/).slice(-2).map(w => w[0]).join("").toUpperCase();
    };

    return (
      <div ref={ref} className={cn("flex items-center -space-x-3", className)} {...props}>
        {visibleUsers.map((user, i) => (
          <div key={user.id} className="relative ring-2 ring-white rounded-full z-10" style={{ zIndex: visibleUsers.length - i }}>
            <Avatar 
              size={size} 
              src={user.avatarUrl} 
              initials={getInitials(user.name)} 
              color={user.color} 
            />
          </div>
        ))}
        {overflowCount > 0 && (
          <div 
            className={cn(
              "relative ring-2 ring-white rounded-full flex items-center justify-center bg-[#eadfd8] text-[#756761] font-bold z-0",
              sizeClasses[size]
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
