import { createElement, forwardRef } from "react";
import { Avatar } from "../ui/display/Avatar";
import { cn } from "../../utils/cn";
import type { AvatarColor } from "../../utils/avatarColor";

export interface NavItemConfig {
  key: string;
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}

export interface MainLayoutUserProfile {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  initials?: string;
  color?: AvatarColor;
  onClick?: () => void;
}

export type MainLayoutLinkRenderer = (
  href: string,
  children: React.ReactNode,
  className: string,
  ariaCurrent?: "page",
) => React.ReactNode;

export type MainLayoutRouterLinkProps = {
  to: string;
  className?: string;
  "aria-current"?: React.AriaAttributes["aria-current"];
  children?: React.ReactNode;
} & React.RefAttributes<HTMLAnchorElement>;

export type MainLayoutLinkComponent =
  | MainLayoutLinkRenderer
  | "a"
  | React.ForwardRefExoticComponent<MainLayoutRouterLinkProps>;

function isRouterLinkComponent(
  component: MainLayoutLinkComponent,
): component is React.ForwardRefExoticComponent<MainLayoutRouterLinkProps> {
  return (typeof component === "object" || typeof component === "function") && "$$typeof" in component;
}

export interface MainLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  brandName?: string;
  brandLogo?: React.ReactNode;
  brandHref?: string;
  onBrandClick?: () => void;
  linkComponent?: MainLayoutLinkComponent;
  navItems: NavItemConfig[];
  activeKey?: string;
  onSelectNav?: (key: string) => void;
  sidebarPromo?: React.ReactNode;
  userProfile?: MainLayoutUserProfile;
  onLogout?: () => void;
  logoutLabel?: string;
  header?: React.ReactNode;
  embedded?: boolean;
}

const DefaultBrandIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

export const MainLayout = forwardRef<HTMLDivElement, MainLayoutProps>(
  (
    {
      className,
      brandName = "Hôm nay ăn gì",
      brandLogo,
      brandHref,
      onBrandClick,
      linkComponent,
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
    ref,
  ) => {
    const profileInitials = userProfile?.initials
      ?? userProfile?.name.trim().split(/\s+/).slice(-2).map((part) => part[0] ?? "").join("").toUpperCase();
    const renderLink: MainLayoutLinkRenderer = (href, content, linkClassName, ariaCurrent) => {
      if (!linkComponent || linkComponent === "a") {
        return <a href={href} className={linkClassName} aria-current={ariaCurrent}>{content}</a>;
      }
      if (isRouterLinkComponent(linkComponent)) {
        return createElement(linkComponent, { to: href, className: linkClassName, "aria-current": ariaCurrent }, content);
      }
      return linkComponent(href, content, linkClassName, ariaCurrent);
    };

    const renderNavigationItem = (item: NavItemConfig, mobile = false) => {
      const active = item.key === activeKey;
      const itemClassName = cn(
        "focus-ring min-h-11 cursor-pointer transition-colors",
        mobile
          ? "flex flex-col items-center justify-center gap-1 rounded-control px-2 py-1 text-center text-micro"
          : "flex w-full items-center justify-between gap-3 rounded-card px-3 py-3 text-body-sm font-semibold",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      );
      const content = (
        <>
          <span className={cn("flex items-center", mobile ? "flex-col gap-1" : "gap-3")}>
            <span aria-hidden="true" className={mobile ? "size-5" : "size-5"}>{item.icon}</span>
            <span>{item.label}</span>
          </span>
          {item.badge && <span>{item.badge}</span>}
        </>
      );

      if (item.href) {
        return (
          <span key={item.key} className={mobile ? "flex-1" : undefined}>
            {renderLink(item.href, content, itemClassName, active ? "page" : undefined)}
          </span>
        );
      }

      return (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelectNav?.(item.key)}
          aria-current={active ? "page" : undefined}
          className={cn(itemClassName, mobile && "w-full")}
        >
          {content}
        </button>
      );
    };

    const brandContent = (
      <>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary text-primary-foreground">
          {brandLogo ?? DefaultBrandIcon}
        </span>
        <span className="truncate text-heading-sm font-bold text-foreground">{brandName}</span>
      </>
    );

    return (
      <div
        ref={ref}
        className={cn("flex h-dvh flex-col overflow-hidden bg-background text-foreground md:flex-row", embedded && "rounded-panel border border-border", className)}
        {...props}
      >
        <a href="#main-content" className="focus-ring sr-only rounded-control bg-card p-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-sticky">
          Bỏ qua đến nội dung chính
        </a>
        <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-border bg-card px-5 py-6 md:flex">
          {brandHref || !onBrandClick
            ? renderLink(brandHref ?? "/", brandContent, "focus-ring mb-8 flex items-center gap-3 rounded-control")
            : (
              <button type="button" onClick={onBrandClick} className="focus-ring mb-8 flex items-center gap-3 rounded-control text-left">
                {brandContent}
              </button>
            )}
          <nav className="flex-1 space-y-2" aria-label="Điều hướng chính">
            {navItems.map((item) => renderNavigationItem(item))}
          </nav>
          {sidebarPromo && <div className="mb-4">{sidebarPromo}</div>}
          {(userProfile || onLogout) && (
            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
              {userProfile && (
                <button type="button" onClick={userProfile.onClick} className="focus-ring flex min-h-11 w-full items-center gap-3 rounded-control p-2 text-left hover:bg-muted">
                  <Avatar size="sm" src={userProfile.avatarUrl} name={userProfile.name} initials={profileInitials} color={userProfile.color} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-bold text-foreground">{userProfile.name}</span>
                    {userProfile.subtitle && <span className="block truncate text-caption text-muted-foreground">{userProfile.subtitle}</span>}
                  </span>
                </button>
              )}
              {onLogout && (
                <button type="button" onClick={onLogout} className="focus-ring flex min-h-11 items-center gap-3 rounded-control p-2 text-body-sm font-semibold text-danger-soft-foreground hover:bg-danger-soft">
                  <span aria-hidden="true">↪</span>{logoutLabel}
                </button>
              )}
            </div>
          )}
        </aside>

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          {header && <div className="shrink-0">{header}</div>}
          <main id="main-content" className="relative min-h-0 flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-nav flex items-center justify-around border-t border-border bg-card px-3 pt-2 pb-safe shadow-nav md:hidden" aria-label="Điều hướng di động">
          {navItems.map((item) => renderNavigationItem(item, true))}
        </nav>
      </div>
    );
  },
);
MainLayout.displayName = "MainLayout";
