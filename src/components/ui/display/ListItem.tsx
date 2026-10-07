import { forwardRef } from "react";
import { Avatar } from "./Avatar";

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  isOnline?: boolean;
  isReady?: boolean; 
  action?: React.ReactNode;
}

export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  ({ className = "", title, subtitle, avatarUrl, avatarInitials, avatarColor = "bg-blue-500", isOnline, isReady, action, ...props }, ref) => {
    // Tự động tạo chữ viết tắt từ title nếu không có truyền vào (VD: "Nam Minh" -> "NA", "Lẩu Phan" -> "LẨ")
    const initials = avatarInitials || title.substring(0, 2).toUpperCase();

    return (
      <div ref={ref} className={`flex items-center justify-between py-2 ${className}`} {...props}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar 
              src={avatarUrl} 
              initials={initials} 
              isOnline={isOnline} 
              color={avatarColor} 
            />
            {isReady !== undefined && (
               <span className={`absolute -top-1 -right-1 size-4 rounded-full border-2 border-white flex items-center justify-center z-10 ${isReady ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                 {isReady && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
               </span>
            )}
          </div>
          <div>
            <p className="font-['Inter:Bold'] font-bold text-[15px] text-[#261b17]">{title}</p>
            {subtitle && <p className="text-[#756761] text-[13px]">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);
ListItem.displayName = "ListItem";
