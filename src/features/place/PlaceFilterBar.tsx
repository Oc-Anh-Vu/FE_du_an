// Thanh công cụ tìm kiếm và bộ lọc địa điểm: tên quán (SearchInput), danh mục ẩm thực (Tag), lọc GPS (Switch) và bán kính (Slider)
import { SearchInput } from '../../components/ui/form/SearchInput';
import { Slider } from '../../components/ui/form/Slider';
import { Switch } from '../../components/ui/form/Switch';
import { Tag } from '../../components/ui/form/Tag';
import { Stack } from '../../components/layout/Stack';
import { cn } from '../../utils/cn';

export interface PlaceFilterBarProps {
  searchName: string;
  categories: string[];
  selectedCategory: string | null;
  useGpsFilter: boolean;
  radiusKm: number;
  hasCoordinates: boolean;
  isLocating?: boolean;
  disabled?: boolean;
  onSearchChange: (value: string) => void;
  onCategorySelect?: (category: string | null) => void;
  onCategoryChange?: (category: string | null) => void;
  onGpsFilterToggle: (enabled: boolean) => void;
  onRadiusChange: (radius: number) => void;
  onRequestLocation?: () => void;
  className?: string;
}

export function PlaceFilterBar({
  searchName,
  categories,
  selectedCategory,
  useGpsFilter,
  radiusKm,
  hasCoordinates,
  isLocating = false,
  disabled = false,
  onSearchChange,
  onCategorySelect,
  onCategoryChange,
  onGpsFilterToggle,
  onRadiusChange,
  onRequestLocation,
  className,
}: PlaceFilterBarProps) {
  const handleCategorySelect = onCategorySelect ?? onCategoryChange ?? (() => {});
  return (
    <section
      aria-label="Bộ lọc tìm kiếm địa điểm"
      className={cn('rounded-panel border border-border bg-card p-4 md:p-6 shadow-card', className)}
    >
      <Stack gap={4}>
        {/* Tìm kiếm theo tên quán */}
        <SearchInput
          label="Tìm kiếm quán ăn"
          placeholder="Nhập tên quán (ví dụ: Cơm tấm, Bún bò, Pizza...)"
          value={searchName}
          disabled={disabled}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          onClear={() => onSearchChange('')}
        />

        {/* Danh mục ẩm thực */}
        <div className="space-y-2">
          <label className="block text-body-sm font-semibold text-foreground">
            Danh mục món ăn
          </label>
          <div className="flex flex-wrap gap-2">
            <Tag
              label="Tất cả"
              selected={selectedCategory === null}
              disabled={disabled}
              onClick={() => handleCategorySelect(null)}
            />
            {categories.map((cat) => (
              <Tag
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                disabled={disabled}
                onClick={() => handleCategorySelect(selectedCategory === cat ? null : cat)}
              />
            ))}
          </div>
        </div>

        {/* Bộ lọc vị trí GPS & Bán kính */}
        <div className="flex flex-col gap-3 rounded-control border border-border/70 bg-muted/40 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Switch
              label="Tìm quán quanh tôi (GPS)"
              checked={useGpsFilter}
              disabled={disabled}
              onCheckedChange={(checked) => {
                if (checked && !hasCoordinates && onRequestLocation) {
                  onRequestLocation();
                }
                onGpsFilterToggle(checked);
              }}
            />

            {!hasCoordinates && useGpsFilter && onRequestLocation && (
              <button
                type="button"
                className="focus-ring text-caption font-semibold text-primary-strong hover:underline disabled:opacity-50"
                onClick={onRequestLocation}
                disabled={disabled || isLocating}
              >
                {isLocating ? 'Đang xác định GPS...' : 'Cấp quyền vị trí GPS ngay'}
              </button>
            )}
          </div>

          {useGpsFilter && (
            <div className="pt-1">
              <Slider
                label="Bán kính tìm kiếm"
                min={0.5}
                max={25}
                step={0.5}
                value={radiusKm}
                disabled={disabled}
                onValueChange={onRadiusChange}
                formatValue={(val) => `${val.toFixed(1)} km`}
              />
            </div>
          )}
        </div>
      </Stack>
    </section>
  );
}

export default PlaceFilterBar;
