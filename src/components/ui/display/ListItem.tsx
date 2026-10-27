import { forwardRef } from "react";
import { Avatar } from "./Avatar";
import { cn } from "../../../utils/cn";

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  avatarSize?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  isReady?: boolean; 
  action?: React.ReactNode;
}

export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  ({ className = "", title, subtitle, avatarUrl, avatarInitials, avatarColor = "bg-blue-500", avatarSize = "md", isOnline, isReady, action, ...props }, ref) => {
    // Tự động tạo chữ viết tắt từ title (VD: "Nam Minh" -> "NM", "Lẩu Phan" -> "LP")
    const initials = avatarInitials || title.trim().split(/\s+/).slice(-2).map(w => w[0]).join("").toUpperCase();

    const isInteractive = !!props.onClick;

    return (
      <div 
        ref={ref} 
        className={cn(
          "flex items-center justify-between py-2 transition-colors rounded-xl", 
          isInteractive && "cursor-pointer hover:bg-gray-50 px-2 -mx-2",
          className
        )} 
        {...(isInteractive ? { role: "button", tabIndex: 0 } : {})}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar 
              src={avatarUrl} 
              initials={initials} 
              isOnline={isOnline} 
              color={avatarColor} 
              size={avatarSize}
            />
            {isReady !== undefined && (
               <span className={cn("absolute -top-1 -right-1 size-4 rounded-full border-2 border-white flex items-center justify-center z-10", isReady ? 'bg-green-500 text-white' : 'bg-gray-300')}>
                 {isReady && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
               </span>
            )}
          </div>
          <div>
            <p className="font-bold text-[15px] text-[#261b17]">{title}</p>
            {subtitle && <p className="text-[#756761] text-[13px]">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);
ListItem.displayName = "ListItem";
