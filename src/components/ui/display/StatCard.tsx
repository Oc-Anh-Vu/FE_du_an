import { forwardRef } from "react";
import { Card } from "./Card";
import { cn } from "../../../utils/cn";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "dark" | "danger";
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, description, icon, variant = "default", ...props }, ref) => {
    
    const variants = {
      default: "bg-white text-[#261b17] border-[#eadfd8]",
      dark: "bg-[#261b17] text-white border-transparent",
      danger: "bg-[#fff0ed] text-[#c63d1c] border-[#ffcdbe]",
    };

    const valueColors = {
      default: "text-[#f05a32]",
      dark: "text-white",
      danger: "text-[#c63d1c]",
    };

    const descColors = {
      default: "text-[#756761]",
      dark: "text-gray-400",
      danger: "text-[#d16147]",
    };

    return (
      <Card 
        ref={ref} 
        variant="default" // base shape
        className={cn("border", variants[variant], className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className={cn("text-[14px] font-medium opacity-80", variant === "default" && "text-[#756761]")}>
              {title}
            </h3>
            <div className={cn("text-[24px] font-bold", valueColors[variant])}>
              {value}
            </div>
            {description && (
              <p className={cn("text-[13px]", descColors[variant])}>
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn("p-2 rounded-full", variant === "dark" ? "bg-white/10" : variant === "danger" ? "bg-[#ffcdbe]/50" : "bg-[#fff8f1]")}>
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
);
StatCard.displayName = "StatCard";
