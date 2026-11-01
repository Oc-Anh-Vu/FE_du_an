import { MapPin, LocateFixed } from 'lucide-react';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button, Input, SearchInput, Slider } from '../../components/ui/form';
import type { GeoCoordinates } from '../../utils/geoCalculator';

interface PlaceFilterBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  coordinates: GeoCoordinates | null;
  onLocate: () => void;
  onClearLocation: () => void;
  radius: number;
  onRadiusChange: (value: number) => void;
  locating: boolean;
  locationError: string | null;
}

export default function PlaceFilterBar({
  searchTerm,
  onSearchTermChange,
  category,
  onCategoryChange,
  coordinates,
  onLocate,
  onClearLocation,
  radius,
  onRadiusChange,
  locating,
  locationError,
}: PlaceFilterBarProps) {
  return (
    <section aria-label="Bộ lọc địa điểm" className="rounded-panel border border-border bg-card p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <SearchInput
          label="Tìm theo tên"
          placeholder="Ví dụ: phở, bún bò..."
          value={searchTerm}
          disabled={coordinates !== null}
          hint={
            coordinates
              ? 'Bộ lọc vị trí chỉ kết hợp được với danh mục. Bỏ lọc vị trí để tìm theo tên.'
              : undefined
          }
          onChange={(event) => onSearchTermChange(event.currentTarget.value)}
          onClear={() => onSearchTermChange('')}
        />
        <Input
          label="Danh mục"
          placeholder="Ví dụ: Món Việt, Đồ uống..."
          value={category}
          onChange={(event) => onCategoryChange(event.currentTarget.value)}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant={coordinates ? 'outline' : 'secondary'}
          loading={locating}
          loadingText="Đang lấy vị trí..."
          leftIcon={<LocateFixed aria-hidden="true" size={18} />}
          onClick={onLocate}
        >
          {coordinates ? 'Cập nhật vị trí của tôi' : 'Tìm quanh vị trí của tôi'}
        </Button>
        {coordinates && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" size={16} />
              Đang tìm trong bán kính {radius} km
            </span>
            <button
              type="button"
              onClick={onClearLocation}
              className="focus-ring rounded-sm font-semibold text-primary-strong underline underline-offset-2"
            >
              Bỏ lọc vị trí
            </button>
          </div>
        )}
      </div>

      {coordinates && (
        <div className="mt-3 max-w-xl">
          <Slider
            label="Bán kính tìm kiếm"
            min={1}
            max={50}
            step={1}
            value={radius}
            onValueChange={onRadiusChange}
            formatValue={(value) => `${value} km`}
          />
        </div>
      )}

      {locationError && (
        <Alert className="mt-4" variant="warning" title="Không thể lấy vị trí">
          {locationError}
        </Alert>
      )}
    </section>
  );
}
