// Thành phần điều phối khám phá địa điểm: thanh lọc PlaceFilterBar, chuyển đổi chế độ Danh sách / Quẹt thẻ qua SegmentedControl, lưới PlaceCard, SoloSwipeDeck và xử lý lỗi 403
import { useMemo, useState } from 'react';
import { Alert } from '../../components/ui/feedback/Alert';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { Skeleton } from '../../components/ui/feedback/Skeleton';
import { Button } from '../../components/ui/form/Button';
import { SegmentedControl, type SegmentOption } from '../../components/ui/form/SegmentedControl';
import { PlaceCard } from '../../components/ui/display/PlaceCard';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { PlaceResponse } from '../../types/api';
import { cn } from '../../utils/cn';
import { getPlaceDistanceKm } from '../../utils/geoCalculator';
import PlaceFilterBar from './PlaceFilterBar';
import SoloMatchModal from './SoloMatchModal';
import SoloSwipeDeck from './SoloSwipeDeck';
import { toPlaceCardItem, usePlaceActions, type UsePlaceActionsReturn } from './usePlaceActions';

export type CatalogMode = 'list' | 'swipe';

const VIEW_OPTIONS: SegmentOption[] = [
  { label: 'Danh sách', value: 'list' },
  { label: 'Quẹt thẻ', value: 'swipe' },
];

export interface PlaceCatalogViewProps {
  mode?: CatalogMode;
  initialMode?: CatalogMode;
  onModeChange?: (mode: CatalogMode) => void;
  actions?: UsePlaceActionsReturn;
  className?: string;
}

export function PlaceCatalogView({
  mode: controlledMode,
  initialMode = 'list',
  onModeChange,
  actions: customActions,
  className,
}: PlaceCatalogViewProps) {
  const defaultActions = usePlaceActions(undefined, { autoFetch: !customActions });
  const actions = customActions ?? defaultActions;

  const { coordinates, hasCoordinates, isRequesting, requestLocation } = useGeolocation();

  const [uncontrolledMode, setUncontrolledMode] = useState<CatalogMode>(initialMode);
  const isControlled = controlledMode !== undefined;
  const mode = isControlled ? controlledMode : uncontrolledMode;

  const handleModeChange = (newMode: CatalogMode) => {
    if (!isControlled) {
      setUncontrolledMode(newMode);
    }
    onModeChange?.(newMode);
  };

  const {
    filters,
    updateFilter,
    places,
    categories,
    isLoading,
    error,
    isForbidden,
    fetchPlaces,
    soloIndex,
    matchedSoloPlace,
    isMatchModalOpen,
    skipSoloPlace,
    likeSoloPlace,
    resetSoloDeck,
    closeSoloMatchModal,
  } = actions;

  // Tính khoảng cách cho quán vừa được match để truyền vào SoloMatchModal
  const matchedDistanceKm = useMemo(() => {
    if (!matchedSoloPlace) return undefined;
    return getPlaceDistanceKm(coordinates, {
      latitude: matchedSoloPlace.latitude,
      longitude: matchedSoloPlace.longitude,
    });
  }, [coordinates, matchedSoloPlace]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. Thanh lọc tìm kiếm, danh mục và GPS */}
      <PlaceFilterBar
        searchName={filters.searchName}
        categories={categories}
        selectedCategory={filters.selectedCategory}
        useGpsFilter={filters.useGpsFilter}
        radiusKm={filters.radiusKm}
        hasCoordinates={hasCoordinates}
        isLocating={isRequesting}
        onSearchChange={(val: string) => updateFilter({ searchName: val })}
        onCategorySelect={(cat: string | null) => updateFilter({ selectedCategory: cat })}
        onGpsFilterToggle={(enabled: boolean) => updateFilter({ useGpsFilter: enabled })}
        onRadiusChange={(radius: number) => updateFilter({ radiusKm: radius })}
        onRequestLocation={() => void requestLocation()}
      />

      {/* 2. Cảnh báo lỗi 403 từ SecurityConfig.java */}
      {isForbidden && (
        <Alert
          variant="warning"
          title="Quyền truy cập danh sách địa điểm (HTTP 403)"
          action={
            <Button variant="outline" size="sm" onClick={() => void fetchPlaces()}>
              Thử tải lại
            </Button>
          }
        >
          {error ||
            'Máy chủ hiện tại yêu cầu quyền Quản trị viên để truy xuất danh sách quán ăn toàn hệ thống. Phiên đăng nhập của bạn vẫn an toàn.'}
        </Alert>
      )}

      {/* 3. Lỗi chung khác (nếu không phải 403) */}
      {!isForbidden && error && (
        <Alert
          variant="danger"
          title="Lỗi tải dữ liệu"
          action={
            <Button variant="outline" size="sm" onClick={() => void fetchPlaces()}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* 4. Thanh chuyển đổi chế độ Danh sách / Quẹt thẻ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-heading font-bold text-foreground">
          {mode === 'list' ? 'Danh sách quán ăn' : 'Quẹt thẻ chọn quán cá nhân'}
          <span className="ml-2 text-body-sm font-normal text-muted-foreground">
            ({places.length} địa điểm)
          </span>
        </h2>

        <div className="w-full sm:w-64">
          <SegmentedControl
            options={VIEW_OPTIONS}
            value={mode}
            aria-label="Chế độ hiển thị địa điểm"
            onValueChange={(val) => handleModeChange(val as CatalogMode)}
          />
        </div>
      </div>

      {/* 5. Nội dung theo chế độ */}
      {mode === 'list' ? (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-3 rounded-card border border-border p-4">
                  <Skeleton variant="rect" height={192} className="w-full rounded-card" />
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="py-8">
              <EmptyState
                size="md"
                icon="🍽️"
                title="Không tìm thấy quán ăn nào"
                description="Bạn hãy thử đổi từ khóa tìm kiếm hoặc mở rộng bán kính quét GPS."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place: PlaceResponse) => {
                const distanceKm = getPlaceDistanceKm(coordinates, {
                  latitude: place.latitude,
                  longitude: place.longitude,
                });
                return (
                  <PlaceCard
                    key={place.id}
                    place={toPlaceCardItem(place)}
                    distanceKm={distanceKm}
                    layout="vertical"
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Chế độ Quẹt thẻ Solo */
        <div>
          <SoloSwipeDeck
            places={places}
            currentIndex={soloIndex}
            userCoordinates={coordinates}
            isLoading={isLoading}
            onLike={likeSoloPlace}
            onSkip={skipSoloPlace}
            onReset={resetSoloDeck}
          />

          {/* Popup chúc mừng chốt quán Solo */}
          <SoloMatchModal
            isOpen={isMatchModalOpen}
            place={matchedSoloPlace}
            distanceKm={matchedDistanceKm}
            onClose={closeSoloMatchModal}
            onContinueSwiping={closeSoloMatchModal}
          />
        </div>
      )}
    </div>
  );
}

export default PlaceCatalogView;
