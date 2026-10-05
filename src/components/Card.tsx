import { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", title, description, footer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-2xl border border-[#eadfd8] overflow-hidden ${className}`}
        {...props}
      >
        {(title || description) && (
          <div className="p-4 border-b border-[#eadfd8]">
            {title && <h3 className="font-['Inter:Bold'] font-bold text-[16px] text-[#261b17]">{title}</h3>}
            {description && <p className="text-[#756761] text-[13px] mt-1">{description}</p>}
          </div>
        )}
        <div className="p-4">{children}</div>
        {footer && <div className="p-4 border-t border-[#eadfd8] bg-gray-50">{footer}</div>}
      </div>
    );
  }
);
Card.displayName = "Card";
