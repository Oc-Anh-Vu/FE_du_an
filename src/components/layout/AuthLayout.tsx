import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export interface AuthLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  logo?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  embedded?: boolean;
}

const DefaultAuthLogo = (
  <div className="bg-[#f05a32] flex items-center justify-center rounded-[16px] size-[48px] shadow-sm">
    <svg
      width="24"
      height="24"
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
  </div>
);

export const AuthLayout = forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ className, logo, title, subtitle, footer, embedded = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[#fff8f1] flex items-center justify-center p-4 font-sans text-[#261b17]",
          embedded ? "py-10 rounded-3xl border border-[#eadfd8]" : "min-h-screen",
          className
        )}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md bg-white border border-[#eadfd8] rounded-[24px] p-6 md:p-8 shadow-sm"
        >
          <div className="flex justify-center mb-6">
            {logo || DefaultAuthLogo}
          </div>

          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-[24px] font-bold text-[#261b17] tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[#756761] mt-2 text-[14px]">{subtitle}</p>
              )}
            </div>
          )}

          <div>{children}</div>

          {footer && <div className="mt-8 text-center text-[14px] text-[#756761]">{footer}</div>}
        </motion.div>
      </div>
    );
  }
);
AuthLayout.displayName = "AuthLayout";
