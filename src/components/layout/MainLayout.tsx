import { forwardRef } from "react";
import { Avatar } from "../ui/display/Avatar";
import { cn } from "../../utils/cn";

export interface NavItemConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}

export interface MainLayoutUserProfile {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  initials?: string;
  color?: string;
  onClick?: () => void;
}

export interface MainLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  brandName?: string;
  brandLogo?: React.ReactNode;
  onBrandClick?: () => void;
  navItems: NavItemConfig[];
  activeKey?: string;
  onSelectNav?: (key: string) => void;
  sidebarPromo?: React.ReactNode;
  userProfile?: MainLayoutUserProfile;
  onLogout?: () => void;
  logoutLabel?: string;
  header?: React.ReactNode;
  /** Cho phép hiển thị ở chế độ nhúng (preview) thay vì chiếm full h-screen */
  embedded?: boolean;
}

const DefaultBrandIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

export const MainLayout = forwardRef<HTMLDivElement, MainLayoutProps>(
  (
    {
      className,
      brandName = "Hôm nay ăn gì",
      brandLogo,
      onBrandClick,
      navItems,
      activeKey,
      onSelectNav,
      sidebarPromo,
      userProfile,
      onLogout,
      logoutLabel = "Đăng xuất",
      header,
      embedded = false,
      children,
      ...props
    },
    ref
  ) => {
    const profileInitials =
      userProfile?.initials ||
      userProfile?.name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    return (
      <div
        ref={ref}
        className={cn(
          "flex bg-[#fff8f1] overflow-hidden flex-col md:flex-row font-sans text-[#261b17]",
          embedded ? "h-[640px] rounded-3xl border border-[#eadfd8]" : "h-screen",
          className
        )}
        {...props}
      >
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[230px] bg-white border-r border-[#eadfd8] flex-col h-full shrink-0 py-7 px-5">
          <button
            type="button"
            onClick={onBrandClick}
            className="flex items-center gap-2.5 mb-8 text-left cursor-pointer focus:outline-none"
          >
            <div className="bg-[#f05a32] flex items-center justify-center rounded-[12px] size-[38px] shrink-0">
              {brandLogo || DefaultBrandIcon}
            </div>
            <span className="font-extrabold text-[18px] text-[#261b17] tracking-tight truncate">
              {brandName}
            </span>
          </button>

          <nav className="flex-1 space-y-2" aria-label="Điều hướng chính">
            {navItems.map((item) => {
              const active = item.key === activeKey;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectNav?.(item.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-[16px] transition-colors font-bold text-[14px] cursor-pointer",
                    active
                      ? "bg-[#ffe0d3] text-[#c63d1c]"
                      : "bg-white text-[#756761] hover:bg-gray-50 hover:text-[#261b17]"
                  )}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {item.badge && <span>{item.badge}</span>}
                </button>
              );
            })}
          </nav>

          {sidebarPromo && <div className="mb-4">{sidebarPromo}</div>}

          {(userProfile || onLogout) && (
            <div className="pt-4 border-t border-[#eadfd8] mt-auto flex flex-col gap-2">
              {userProfile && (
                <button
                  type="button"
                  onClick={userProfile.onClick}
                  className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors text-left cursor-pointer"
                >
                  <Avatar
                    size="sm"
                    src={userProfile.avatarUrl}
                    initials={profileInitials}
                    color={userProfile.color || "bg-purple-500"}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] text-[#261b17] truncate">
                      {userProfile.name}
                    </p>
                    {userProfile.subtitle && (
                      <p className="text-[#756761] text-[11px] truncate">
                        {userProfile.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-3 text-red-500 font-bold text-[14px] p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {logoutLabel}
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {header && <div className="shrink-0">{header}</div>}
          <main className="flex-1 overflow-y-auto relative">{children}</main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav
          className="md:hidden border-t border-[#eadfd8] bg-white pt-2 pb-2 px-4 flex justify-around items-center shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
          aria-label="Điều hướng di động"
        >
          {navItems.map((item) => {
            const active = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectNav?.(item.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 p-1.5 cursor-pointer",
                  active ? "text-[#f05a32]" : "text-[#756761]"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-colors",
                    active && "bg-[#ffe0d3]"
                  )}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }
);
MainLayout.displayName = "MainLayout";
