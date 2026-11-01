import { useEffect, useMemo, useState } from 'react';
import { MapPin, RotateCcw } from 'lucide-react';
import { PlaceCard } from '../../components/ui/display';
import { Alert } from '../../components/ui/feedback/Alert';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { Button, SegmentedControl } from '../../components/ui/form';
import { normalizeApiError } from '../../services/apiClient';
import { getPlace, getPlaces } from '../../services/placeService';
import { ApiErrorCode, type PlaceFilterParams, type PlaceResponse } from '../../types';
import { getPlaceDistanceKm, type GeoCoordinates } from '../../utils/geoCalculator';
import SoloMatchModal from './SoloMatchModal';
import SoloSwipeDeck from './SoloSwipeDeck';

interface PlaceCatalogViewProps {
  searchTerm: string;
  category: string;
  coordinates: GeoCoordinates | null;
  radius: number;
  mode: 'list' | 'swipe';
  onModeChange: (mode: 'list' | 'swipe') => void;
  onClearFilters: () => void;
}

interface PlaceLoadState {
  requestKey: string;
  status: 'loading' | 'success' | 'error';
  places: PlaceResponse[];
  error: string | null;
}

function getPlaceErrorMessage(error: unknown): string {
  const normalized = normalizeApiError(error);
  if (normalized.status === 403 || normalized.code === ApiErrorCode.UNAUTHORIZED) {
    return 'Tài khoản hiện chưa được cấp quyền xem danh sách địa điểm. Vui lòng liên hệ quản trị viên hoặc thử lại sau khi quyền truy cập được cập nhật.';
  }
  return normalized.message;
}

export default function PlaceCatalogView({
  searchTerm,
  category,
  coordinates,
  radius,
  mode,
  onModeChange,
  onClearFilters,
}: PlaceCatalogViewProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm.trim());
  const [retryKey, setRetryKey] = useState(0);
  const [placeLoadState, setPlaceLoadState] = useState<PlaceLoadState>({
    requestKey: '',
    status: 'loading',
    places: [],
    error: null,
  });
  const [selectedPlace, setSelectedPlace] = useState<PlaceResponse | null>(null);
  const [placeDetails, setPlaceDetails] = useState<PlaceResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  const filters = useMemo<PlaceFilterParams>(() => {
    const normalizedCategory = category.trim();
    if (coordinates) {
      return {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius,
        ...(normalizedCategory ? { category: normalizedCategory } : {}),
      };
    }
    if (debouncedSearch) return { name: debouncedSearch };
    if (normalizedCategory) return { category: normalizedCategory };
    return {};
  }, [category, coordinates, debouncedSearch, radius]);
  const requestKey = useMemo(
    () => JSON.stringify([filters, retryKey]),
    [filters, retryKey],
  );
  const currentPlaceLoadState =
    placeLoadState.requestKey === requestKey ? placeLoadState : null;
  const loading = currentPlaceLoadState === null || currentPlaceLoadState.status === 'loading';
  const places = currentPlaceLoadState?.places ?? [];
  const error = currentPlaceLoadState?.error ?? null;

  useEffect(() => {
    const controller = new AbortController();
    getPlaces(filters, controller.signal)
      .then((result) => {
        setPlaceLoadState({
          requestKey,
          status: 'success',
          places: result,
          error: null,
        });
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setPlaceLoadState({
            requestKey,
            status: 'error',
            places: [],
            error: getPlaceErrorMessage(requestError),
          });
        }
      })

    return () => controller.abort();
  }, [filters, requestKey]);

  useEffect(() => {
    if (!selectedPlace) return;

    const controller = new AbortController();
    getPlace(selectedPlace.id, controller.signal)
      .then((result) => setPlaceDetails(result))
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setDetailsError(getPlaceErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailsLoading(false);
      });

    return () => controller.abort();
  }, [selectedPlace]);

  function openPlace(place: PlaceResponse, celebrate: boolean) {
    setPlaceDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);
    setSelectedPlace(place);
    setCelebrating(celebrate);
    if (celebrate) setCelebrationTrigger((current) => current + 1);
  }

  const userCoordinates = coordinates;

  return (
    <section className="space-y-4" aria-label="Danh sách địa điểm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading font-bold text-foreground">Địa điểm dành cho bạn</h2>
          {coordinates && (
            <p className="mt-1 inline-flex items-center gap-1 text-body-sm text-muted-foreground">
              <MapPin aria-hidden="true" size={15} /> Trong bán kính {radius} km
            </p>
          )}
        </div>
        <SegmentedControl
          aria-label="Chế độ xem địa điểm"
          value={mode}
          onValueChange={(value) => {
            if (value === 'list' || value === 'swipe') onModeChange(value);
          }}
          options={[
            { label: 'Danh sách', value: 'list' },
            { label: 'Quẹt thẻ', value: 'swipe' },
          ]}
          className="w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-panel border border-border bg-card" role="status">
          <Spinner size="lg" />
          <span className="sr-only">Đang tải địa điểm...</span>
        </div>
      ) : error ? (
        <Alert
          variant="danger"
          title="Không thể tải địa điểm"
          action={
            <Button
              variant="outline"
              leftIcon={<RotateCcw aria-hidden="true" size={16} />}
              onClick={() => setRetryKey((current) => current + 1)}
            >
              Thử lại
            </Button>
          }
          role="alert"
        >
          {error}
        </Alert>
      ) : places.length === 0 ? (
        <EmptyState
          title="Chưa tìm thấy địa điểm phù hợp"
          description="Hãy thử từ khóa hoặc bộ lọc khác để khám phá thêm."
          icon="🔎"
          action={<Button variant="outline" onClick={onClearFilters}>Xóa bộ lọc</Button>}
        />
      ) : mode === 'swipe' ? (
        <SoloSwipeDeck
          key={places.map((place) => place.id).join('|')}
          places={places}
          onSelectPlace={(place) => openPlace(place, true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {places.map((place) => {
            const distanceKm = getPlaceDistanceKm(userCoordinates, place);
            return (
              <div key={place.id} className="space-y-2">
                <PlaceCard place={place} distanceKm={distanceKm} />
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => openPlace(place, false)}
                  aria-label={`Xem chi tiết ${place.name}`}
                >
                  Xem chi tiết
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <SoloMatchModal
        place={placeDetails ?? selectedPlace}
        isOpen={selectedPlace !== null}
        celebrating={celebrating}
        celebrationTrigger={celebrationTrigger}
        detailsLoading={detailsLoading}
        detailsError={detailsError}
        onClose={() => setSelectedPlace(null)}
        onContinue={() => setSelectedPlace(null)}
      />
    </section>
  );
}
