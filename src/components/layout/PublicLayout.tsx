import { createElement, type AriaAttributes, type ForwardRefExoticComponent, type ReactNode, type RefAttributes } from "react";
import { buttonVariants } from "../ui/form/buttonVariants";
import { cn } from "../../utils/cn";

export type PublicLayoutLinkRenderer = (href: string, children: ReactNode, className: string) => ReactNode;

export type PublicLayoutRouterLinkProps = {
  to: string;
  className?: string;
  "aria-current"?: AriaAttributes["aria-current"];
  children?: ReactNode;
} & RefAttributes<HTMLAnchorElement>;

export type PublicLayoutLinkComponent =
  | PublicLayoutLinkRenderer
  | "a"
  | ForwardRefExoticComponent<PublicLayoutRouterLinkProps>;

function isRouterLinkComponent(
  component: PublicLayoutLinkComponent,
): component is ForwardRefExoticComponent<PublicLayoutRouterLinkProps> {
  return (typeof component === "object" || typeof component === "function") && "$$typeof" in component;
}

export interface PublicLayoutProps {
  children: ReactNode;
  brandName?: string;
  linkComponent?: PublicLayoutLinkComponent;
  renderLink?: PublicLayoutLinkRenderer;
  loginHref?: string;
  signupHref?: string;
  rightActions?: ReactNode;
  footerText?: ReactNode;
  isAuthenticated?: boolean;
}

export function PublicLayout({
  children,
  brandName = "Hôm Nay Ăn Gì",
  linkComponent,
  renderLink,
  loginHref = "/login",
  signupHref = "/signup",
  rightActions,
  footerText = "Hôm Nay Ăn Gì — cùng nhau chọn một bữa thật ngon.",
  isAuthenticated = false,
}: PublicLayoutProps) {
  const render = linkComponent ?? renderLink;
  const link = (href: string, label: ReactNode, className: string) => {
    if (!render || render === "a") {
      return <a className={className} href={href}>{label}</a>;
    }
    if (isRouterLinkComponent(render)) {
      return createElement(render, { to: href, className }, label);
    }
    return render(href, label, className);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        className="focus-ring sr-only rounded-control bg-card p-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-sticky"
        href="#main-content"
      >
        Bỏ qua đến nội dung chính
      </a>
      <header className="sticky top-0 z-sticky h-16 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          {link("/", brandName, "focus-ring rounded-control text-heading-sm font-bold text-foreground")}
          <nav aria-label="Điều hướng công khai" className="flex items-center gap-2 md:gap-3">
            {link(
              isAuthenticated ? "/app" : loginHref,
              isAuthenticated ? "Vào ứng dụng" : "Đăng nhập",
              cn(buttonVariants({ variant: "ghost", size: "sm" }), "md:h-10 md:px-4 md:text-body-sm"),
            )}
            {!isAuthenticated && link(
              signupHref,
              "Đăng ký",
              cn(buttonVariants({ variant: "primary", size: "sm" }), "rounded-full md:h-10 md:px-4 md:text-body-sm"),
            )}
            {rightActions}
          </nav>
        </div>
      </header>
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <footer className="border-t border-border px-4 py-8 text-center text-caption text-muted-foreground">
        {footerText}
      </footer>
    </div>
  );
}
