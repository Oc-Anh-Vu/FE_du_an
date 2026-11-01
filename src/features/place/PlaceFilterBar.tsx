import { LocateFixed, MapPin } from "lucide-react";
import { Slider } from "../../components/ui/form/Slider";
import { SearchInput } from "../../components/ui/form/SearchInput";
import { Tag } from "../../components/ui/form/Tag";

export interface PlaceFilterBarProps {
  searchValue: string;
  categories: string[];
  selectedCategory: string | null;
  radiusKm: number;
  hasLocation: boolean;
  locating: boolean;
  disabled?: boolean;
  locationError?: string | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string | null) => void;
  onRadiusChange: (radius: number) => void;
  onRequestLocation: () => void;
}

export default function PlaceFilterBar({
  searchValue,
  categories,
  selectedCategory,
  radiusKm,
  hasLocation,
  locating,
  disabled = false,
  locationError,
  onSearchChange,
  onCategoryChange,
  onRadiusChange,
  onRequestLocation,
}: PlaceFilterBarProps) {
  return (
    <section
      aria-label="Bộ lọc địa điểm"
      className="space-y-4 rounded-panel border border-border bg-card p-4 md:p-5"
    >
      <SearchInput
        label="Tìm địa điểm"
        placeholder="Nhập tên quán..."
        value={searchValue}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        disabled={disabled}
      />

      <div className="space-y-2">
        <h2 className="text-body-sm font-semibold text-foreground">Danh mục</h2>
        <div className="flex flex-wrap gap-2">
          <Tag
            label="Tất cả"
            selected={selectedCategory === null}
            disabled={disabled}
            onClick={() => onCategoryChange(null)}
          />
          {categories.map((category) => (
            <Tag
              key={category}
              label={category}
              selected={selectedCategory === category}
              disabled={disabled}
              onClick={() =>
                onCategoryChange(selectedCategory === category ? null : category)
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-control text-body-sm font-semibold text-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onRequestLocation}
          disabled={disabled || locating}
          aria-busy={locating || undefined}
        >
          {hasLocation ? (
            <MapPin aria-hidden="true" size={18} />
          ) : (
            <LocateFixed aria-hidden="true" size={18} />
          )}
          {locating
            ? "Đang lấy vị trí..."
            : hasLocation
              ? "Đã dùng vị trí của bạn"
              : "Tìm quán gần tôi"}
        </button>
        {locationError && (
          <p role="status" className="text-caption text-danger">
            {locationError}
          </p>
        )}
      </div>

      {hasLocation && (
        <Slider
          label="Bán kính tìm kiếm"
          min={0.1}
          max={25}
          step={0.1}
          value={radiusKm}
          onValueChange={onRadiusChange}
          formatValue={(value) => `${value.toFixed(1)} km`}
          disabled={disabled}
        />
      )}
    </section>
  );
}
