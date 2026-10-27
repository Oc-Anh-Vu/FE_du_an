import type { ReactNode } from "react"

export interface PublicLayoutProps {
  children: ReactNode
  renderLink?: (href: string, children: ReactNode, className: string) => ReactNode
  isAuthenticated?: boolean
}

export function PublicLayout({
  children,
  renderLink,
  isAuthenticated = false,
}: PublicLayoutProps) {
  const link = (href: string, label: string, className: string) =>
    renderLink ? (
      renderLink(href, label, className)
    ) : (
      <a className={className} href={href}>
        {label}
      </a>
    )

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        className="focus-ring sr-only rounded-control bg-card p-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-sticky"
        href="#main-content"
      >
        Đến nội dung chính
      </a>
      <header className="sticky top-0 z-sticky border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
          {link(
            "/",
            "Hôm nay ăn gì",
            "focus-ring rounded-control font-bold text-foreground",
          )}
          <nav aria-label="Điều hướng công khai" className="flex items-center gap-3">
            {link(
              isAuthenticated ? "/app" : "/login",
              isAuthenticated ? "Vào ứng dụng" : "Đăng nhập",
              "focus-ring rounded-control px-3 py-2 text-sm font-semibold text-foreground",
            )}
            {!isAuthenticated &&
              link(
                "/signup",
                "Đăng ký",
                "focus-ring rounded-control bg-primary-hover px-4 py-2 text-sm font-semibold text-primary-foreground",
              )}
          </nav>
        </div>
      </header>
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Hôm Nay Ăn Gì — cùng nhau chọn một bữa thật ngon.
      </footer>
    </div>
  )
}
