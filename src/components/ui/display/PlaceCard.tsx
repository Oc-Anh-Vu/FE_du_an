import { forwardRef } from "react";
import { Badge } from "./Badge";
import { Button } from "../form/Button";

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
}

export const PlaceCard = forwardRef<HTMLDivElement, PlaceCardProps>(
  ({ className = "", place, onLike, onPass, showActions = false, ...props }, ref) => {
    const renderPrice = (level: number) => {
      return Array(level).fill("💰").join("");
    };

    return (
      <div
        ref={ref}
        className={`bg-white rounded-2xl overflow-hidden border border-[#eadfd8] group ${className}`}
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
            <h3 className="font-['Inter:Bold'] font-bold text-[18px] text-[#261b17]">{place.name}</h3>
          </div>
          <p className="text-[#756761] text-[14px] mb-3">
            {place.category} · {place.address} · {renderPrice(place.price_range)}
          </p>

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
