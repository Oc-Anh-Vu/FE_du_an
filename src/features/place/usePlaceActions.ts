// Hook điều phối nghiệp vụ Khám phá Địa điểm và Quẹt thẻ Solo: tìm kiếm, bộ lọc GPS/danh mục, xử lý lỗi 403 và state bộ bài cá nhân
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useGeolocation } from '../../hooks/useGeolocation';
import { normalizeApiError } from '../../services/apiClient';
import { placeService } from '../../services/place.service';
import { ApiErrorCode, type PlaceFilterParams, type PlaceResponse } from '../../types/api';
import type { Place } from '../../components/ui/display/PlaceCard';

export const DEFAULT_PLACE_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23f3eee7'/%3E%3Ctext x='50%25' y='54%25' text-anchor='middle' font-size='72'%3E%F0%9F%8D%BD%3C/text%3E%3C/svg%3E";

/** Chuyển đổi DTO PlaceResponse từ Backend sang giao diện hiển thị của Dumb Component PlaceCard */
export function toPlaceCardItem(place: PlaceResponse): Place {
  const priceRange =
    place.priceRange === 2 || place.priceRange === 3 ? place.priceRange : 1;

  return {
    id: place.id,
    name: place.name,
    category: place.category?.trim() || 'Khác',
    price_range: priceRange as 1 | 2 | 3,
    image_url: place.imageUrl?.trim() || DEFAULT_PLACE_IMAGE,
    address: place.address?.trim() || 'Chưa cập nhật địa chỉ',
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

export interface PlaceFilterState {
  searchName: string;
  selectedCategory: string | null;
  useGpsFilter: boolean;
  radiusKm: number;
}

export interface UsePlaceActionsReturn {
  // Bộ lọc
  filters: PlaceFilterState;
  debouncedSearchName: string;
  updateFilter: (partial: Partial<PlaceFilterState>) => void;
  resetFilter: () => void;

  // Dữ liệu & Trạng thái tải
  places: PlaceResponse[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  isForbidden: boolean;
  fetchPlaces: (overrideFilters?: Partial<PlaceFilterState>) => Promise<PlaceResponse[]>;

  // Chế độ Quẹt thẻ Solo (Client-side Solo Mode)
  soloIndex: number;
  matchedSoloPlace: PlaceResponse | null;
  isMatchModalOpen: boolean;
  skipSoloPlace: () => void;
  likeSoloPlace: (place: PlaceResponse) => void;
  resetSoloDeck: () => void;
  closeSoloMatchModal: () => void;
}

const INITIAL_FILTERS: PlaceFilterState = {
  searchName: '',
  selectedCategory: null,
  useGpsFilter: false,
  radiusKm: 5.0,
};

export function usePlaceActions(initialFilters?: Partial<PlaceFilterState>): UsePlaceActionsReturn {
  const { coordinates, hasCoordinates } = useGeolocation();

  const [filters, setFilters] = useState<PlaceFilterState>(() => ({
    ...INITIAL_FILTERS,
    ...initialFilters,
  }));

  const debouncedSearchName = useDebounce(filters.searchName, 300);

  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);

  // State Solo Mode
  const [soloIndex, setSoloIndex] = useState<number>(0);
  const [matchedSoloPlace, setMatchedSoloPlace] = useState<PlaceResponse | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);

  // Tham chiếu để tránh race condition khi fetch liên tiếp
  const activeRequestIdRef = useRef<number>(0);

  // Trích xuất danh sách các category duy nhất từ danh sách quán ăn
  const categories = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => {
      const cat = p.category?.trim();
      if (cat) set.add(cat);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [places]);

  const updateFilter = useCallback((partial: Partial<PlaceFilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const fetchPlaces = useCallback(
    async (overrideFilters?: Partial<PlaceFilterState>): Promise<PlaceResponse[]> => {
      const activeFilters = {
        ...filters,
        ...overrideFilters,
      };

      const requestId = ++activeRequestIdRef.current;
      setIsLoading(true);
      setError(null);
      setIsForbidden(false);

      try {
        let params: PlaceFilterParams | undefined;

        // Thứ tự ưu tiên theo đặc tả PlaceController: GPS -> name -> category -> all
        if (activeFilters.useGpsFilter && hasCoordinates && coordinates) {
          params = {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            radius: activeFilters.radiusKm,
            ...(activeFilters.selectedCategory ? { category: activeFilters.selectedCategory } : {}),
          };
        } else if (activeFilters.searchName.trim()) {
          params = {
            name: activeFilters.searchName.trim(),
          };
        } else if (activeFilters.selectedCategory) {
          params = {
            category: activeFilters.selectedCategory,
          };
        }

        const data = await placeService.getPlaces(params);

        if (activeRequestIdRef.current === requestId) {
          setPlaces(data);
          setSoloIndex(0);
          setIsLoading(false);
        }
        return data;
      } catch (err) {
        if (activeRequestIdRef.current === requestId) {
          const apiErr = normalizeApiError(err);

          // Bắt lỗi 403 Forbidden do SecurityConfig.java dòng 139 chưa mở .authenticated() cho GET /places với ROLE_USER
          if (apiErr.status === 403 || apiErr.code === ApiErrorCode.UNAUTHORIZED) {
            setIsForbidden(true);
            setError(
              'Máy chủ hiện đang yêu cầu quyền Quản trị viên để truy cập danh sách địa điểm (403 Forbidden). Bạn có thể thử lại sau.',
            );
          } else {
            setError(apiErr.message || 'Không thể tải danh sách địa điểm, vui lòng thử lại.');
          }

          setPlaces([]);
          setIsLoading(false);
        }
        return [];
      }
    },
    [coordinates, filters, hasCoordinates],
  );

  // Tự động tải lại dữ liệu khi debouncedSearchName, selectedCategory, useGpsFilter, radiusKm hoặc coordinates thay đổi
  useEffect(() => {
    let isSubscribed = true;
    const timerId = window.setTimeout(() => {
      if (isSubscribed) {
        void fetchPlaces({ searchName: debouncedSearchName });
      }
    }, 0);

    return () => {
      isSubscribed = false;
      window.clearTimeout(timerId);
    };
  }, [debouncedSearchName, fetchPlaces, filters.radiusKm, filters.selectedCategory, filters.useGpsFilter]);

  // Actions cho Solo Mode
  const skipSoloPlace = useCallback(() => {
    setSoloIndex((prev) => prev + 1);
  }, []);

  const likeSoloPlace = useCallback((place: PlaceResponse) => {
    setMatchedSoloPlace(place);
    setIsMatchModalOpen(true);
    setSoloIndex((prev) => prev + 1);
  }, []);

  const resetSoloDeck = useCallback(() => {
    setSoloIndex(0);
  }, []);

  const closeSoloMatchModal = useCallback(() => {
    setIsMatchModalOpen(false);
    setMatchedSoloPlace(null);
  }, []);

  return {
    filters,
    debouncedSearchName,
    updateFilter,
    resetFilter,
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
  };
}

export default usePlaceActions;
