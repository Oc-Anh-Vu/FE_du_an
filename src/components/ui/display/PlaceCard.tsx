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

export interface PlaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  place: Place;
  onLike?: () => void;
  onPass?: () => void;
  showActions?: boolean;
  distanceKm?: number;
  layout?: "vertical" | "horizontal";
}

export const PlaceCard = forwardRef<HTMLDivElement, PlaceCardProps>(
  ({ className = "", place, onLike, onPass, showActions = false, distanceKm, layout = "vertical", ...props }, ref) => {
    const renderPrice = (level: number) => {
      return Array(level).fill("💰").join("");
    };

    if (layout === "horizontal") {
      return (
        <div
          ref={ref}
          className={cn("bg-white rounded-2xl overflow-hidden border border-[#eadfd8] group flex", className)}
          {...props}
        >
          <div className="w-24 shrink-0 bg-gray-200 relative">
            <img src={place.image_url} className="w-full h-full object-cover" alt={place.name} />
          </div>
          <div className="p-3 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-[16px] text-[#261b17]">{place.name}</h3>
              {place.rating && (
                <div className="flex items-center text-[12px] font-bold text-[#f05a32]">
                  ⭐ {place.rating}
                </div>
              )}
            </div>
            <p className="text-[#756761] text-[13px] line-clamp-1">
              {place.category} · {renderPrice(place.price_range)}
            </p>
            {distanceKm !== undefined && (
              <p className="text-[#756761] text-[12px] mt-0.5">📍 Cách đây {distanceKm}km</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("bg-white rounded-2xl overflow-hidden border border-[#eadfd8] group", className)}
        {...props}
      >
        <div className="h-48 bg-gray-200 relative">
          <img src={place.image_url} className="w-full h-full object-cover" alt={place.name} />
          {place.rating && (
            <div className="absolute top-3 right-3">
              <Badge variant="default" className="shadow-sm bg-white">
                ⭐ {place.rating}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-[18px] text-[#261b17]">{place.name}</h3>
          </div>
          <p className="text-[#756761] text-[14px] mb-2">
            {place.category} · {place.address} · {renderPrice(place.price_range)}
          </p>
          {distanceKm !== undefined && (
            <p className="text-[#f05a32] text-[13px] font-medium mb-1 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Cách bạn {distanceKm} km
            </p>
          )}

          {showActions && (
            <div className="flex gap-4 mt-4 pt-4 border-t border-[#eadfd8]">
              <Button variant="ghost" className="flex-1 text-[#756761] hover:bg-red-50 hover:text-red-500" onClick={onPass}>
                ✕ Bỏ qua
              </Button>
              <Button variant="primary" className="flex-1 bg-[#f05a32] hover:bg-[#c63d1c]" onClick={onLike}>
                ❤️ Thích
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
PlaceCard.displayName = "PlaceCard";
