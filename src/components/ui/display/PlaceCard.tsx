import { forwardRef } from "react";
import { Badge } from "./Badge";
import { Button } from "../form/Button";
import { cn } from "../../../utils/cn";

export interface Place {
  id: string;
  name: string;
  category: string;
  price_range: 1 | 2 | 3;
  image_url: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
}

export interface PlaceCardProps extends React.HTMLAttributes<HTMLElement> {
  place: Place;
  onLike?: () => void;
  onPass?: () => void;
  showActions?: boolean;
  distanceKm?: number;
  layout?: "vertical" | "horizontal";
}

export const PlaceCard = forwardRef<HTMLElement, PlaceCardProps>(
  ({ className, place, onLike, onPass, showActions = false, distanceKm, layout = "vertical", ...props }, ref) => {
    const priceLevel = "$".repeat(place.price_range);

    return (
      <article
        ref={ref}
        className={cn("group overflow-hidden rounded-card border border-border bg-card text-card-foreground", layout === "horizontal" && "flex", className)}
        {...props}
      >
        <div className={cn("relative shrink-0 bg-muted", layout === "horizontal" ? "w-24" : "h-48")}>
          <img
            src={place.image_url}
            className={cn("h-full w-full object-cover", layout === "horizontal" && "min-h-28")}
            alt={place.name}
          />
          {layout === "vertical" && place.rating !== undefined && (
            <div className="absolute right-3 top-3">
              <Badge className="gap-1 bg-card shadow-card">
                <span aria-hidden="true" className="text-accent">★</span>
                {place.rating}
              </Badge>
            </div>
          )}
        </div>
        <div className={cn("flex min-w-0 flex-1 flex-col", layout === "horizontal" ? "justify-center p-3" : "p-4")}>
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className={cn("min-w-0 truncate font-bold text-foreground", layout === "horizontal" ? "text-body" : "text-heading-sm")}>
              {place.name}
            </h3>
            {layout === "horizontal" && place.rating !== undefined && (
              <span className="shrink-0 text-body-sm font-semibold text-foreground">
                <span aria-hidden="true" className="text-accent">★</span> {place.rating}
              </span>
            )}
          </div>
          <p className={cn("text-body-sm text-muted-foreground", layout === "horizontal" && "line-clamp-1")}>
            {place.category} · <span><span aria-hidden="true">{priceLevel}</span><span className="sr-only">Mức giá {place.price_range} trên 3</span></span>
            {layout === "vertical" && ` · ${place.address}`}
          </p>
          {distanceKm !== undefined && (
            <p className="mt-1 text-caption text-muted-foreground">
              <span aria-hidden="true">⌖ </span>Cách bạn {distanceKm} km
            </p>
          )}
          {showActions && (
            <div className={cn("mt-4 flex gap-3 border-t border-border pt-4", layout === "horizontal" && "mt-3 pt-3")}>
              <Button variant="outline" className="min-h-11 flex-1" onClick={onPass} aria-label={`Bỏ qua ${place.name}`}>
                <span aria-hidden="true">×</span> Bỏ qua
              </Button>
              <Button variant="primary" className="min-h-11 flex-1" onClick={onLike} aria-label={`Thích ${place.name}`}>
                <span aria-hidden="true">♥</span> Thích
              </Button>
            </div>
          )}
        </div>
      </article>
    );
  },
);
PlaceCard.displayName = "PlaceCard";
