import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface AuthLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  brandName?: string;
  logo?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  embedded?: boolean;
}

const DefaultAuthLogo = (
  <span className="flex size-12 items-center justify-center rounded-control bg-primary text-primary-foreground">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  </span>
);

export const AuthLayout = forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ className, brandName = "Hôm Nay Ăn Gì", logo, title, subtitle, footer, embedded = false, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex min-h-dvh items-center justify-center bg-background px-4 py-6 text-foreground", embedded && "rounded-panel border border-border", className)} {...props}>
      <section className="w-full rounded-section bg-card p-4 md:max-w-md md:p-8 md:shadow-raised">
        <div className="mb-6 flex flex-col items-center gap-2">
          {logo ?? DefaultAuthLogo}
          <span className="text-body-sm font-semibold text-muted-foreground">{brandName}</span>
        </div>
        {(title || subtitle) && (
          <header className="mb-6 text-center">
            {title && <h1 tabIndex={-1} className="text-title text-foreground md:text-title-lg">{title}</h1>}
            {subtitle && <p className="mt-2 text-body-sm text-muted-foreground">{subtitle}</p>}
          </header>
        )}
        {children}
        {footer && <footer className="mt-6 text-center text-body-sm text-muted-foreground">{footer}</footer>}
      </section>
    </div>
  ),
);
AuthLayout.displayName = "AuthLayout";
