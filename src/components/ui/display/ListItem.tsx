import { createElement, forwardRef } from "react";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { cn } from "../../../utils/cn";
import { getAvatarColor, type AvatarColor } from "../../../utils/avatarColor";

type ListItemElement = HTMLDivElement | HTMLLIElement;

export interface ListItemProps extends React.HTMLAttributes<ListItemElement> {
  as?: "div" | "li";
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: AvatarColor;
  isOnline?: boolean;
  isReady?: boolean;
  action?: React.ReactNode;
}

export const ListItem = forwardRef<ListItemElement, ListItemProps>(
  (
    {
      as = "div",
      className,
      title,
      subtitle,
      avatarUrl,
      avatarInitials,
      avatarColor,
      isOnline,
      isReady,
      action,
      ...props
    },
    ref,
  ) => {
    const initials =
      avatarInitials ??
      title
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((part) => part[0] ?? "")
        .join("")
        .toUpperCase();

    return createElement(
      as,
      {
        ...props,
        ref,
        className: cn("flex items-center justify-between gap-3 rounded-card py-2", className),
      },
      <>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={avatarUrl}
            name={title}
            initials={initials}
            isOnline={isOnline}
            color={avatarColor ?? getAvatarColor(title)}
            size="md"
            ring={isReady ? "ready" : "none"}
          />
          <div className="min-w-0">
            <p className="truncate text-body font-bold text-foreground">{title}</p>
            {subtitle && <p className="line-clamp-2 text-body-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {isReady && <Badge variant="success" size="sm">Sẵn sàng</Badge>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </>,
    );
  },
);

ListItem.displayName = "ListItem";
