// Hook quản lý quyền truy cập tọa độ GPS, lưu vào userStore và cung cấp tọa độ mặc định
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUserStore } from '../store/userStore';
import {
  getPlaceDistanceKm,
  isValidCoordinates,
  type GeoCoordinates,
} from '../utils/geoCalculator';

export type DefaultCityPreset = 'HCM' | 'HANOI';

export type GeolocationPermissionStatus =
  | 'IDLE'
  | 'REQUESTING'
  | 'GRANTED'
  | 'DENIED'
  | 'UNSUPPORTED'
  | 'FALLBACK';

export interface CityLocationPreset extends GeoCoordinates {
  label: string;
}

export const DEFAULT_CITY_LOCATIONS: Record<DefaultCityPreset, CityLocationPreset> = {
  HCM: {
    label: 'Trung tâm TP.HCM (Quận 1)',
    latitude: 10.776889,
    longitude: 106.700806,
  },
  HANOI: {
    label: 'Trung tâm Hà Nội (Thanh Xuân)',
    latitude: 20.984567,
    longitude: 105.797789,
  },
};

export interface UseGeolocationOptions {
  autoRequest?: boolean;
  enableHighAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}

export interface UseGeolocationReturn {
  coordinates: GeoCoordinates | null;
  hasCoordinates: boolean;
  status: GeolocationPermissionStatus;
  isRequesting: boolean;
  error: string | null;
  requestLocation: () => Promise<GeoCoordinates | null>;
  useDefaultLocation: (preset?: DefaultCityPreset) => GeoCoordinates;
  setCustomLocation: (coords: GeoCoordinates) => boolean;
  clearLocation: () => void;
  getDistanceFromMeKm: (target: GeoCoordinates | null | undefined) => number | undefined;
}

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_AGE_MS = 300000;

function formatGeolocationError(geoError: GeolocationPositionError): string {
  switch (geoError.code) {
    case geoError.PERMISSION_DENIED:
      return 'Bạn đã từ chối quyền truy cập vị trí GPS. Bạn có thể chọn tọa độ mặc định TP.HCM hoặc Hà Nội.';
    case geoError.POSITION_UNAVAILABLE:
      return 'Không thể xác định được vị trí hiện tại của thiết bị.';
    case geoError.TIMEOUT:
      return 'Yêu cầu lấy tọa độ GPS đã quá thời gian chờ.';
    default:
      return 'Đã xảy ra lỗi khi truy cập vị trí GPS.';
  }
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const {
    autoRequest = false,
    enableHighAccuracy = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maximumAgeMs = DEFAULT_MAX_AGE_MS,
  } = options;

  const coordinates = useUserStore((state) => state.coordinates);
  const setCoordinates = useUserStore((state) => state.setCoordinates);

  const [status, setStatus] = useState<GeolocationPermissionStatus>(() =>
    isValidCoordinates(coordinates) ? 'GRANTED' : 'IDLE',
  );
  const [error, setError] = useState<string | null>(null);
  const autoRequestedRef = useRef(false);

  const requestLocation = useCallback((): Promise<GeoCoordinates | null> => {
    if (typeof window === 'undefined' || !('geolocation' in window.navigator)) {
      setStatus('UNSUPPORTED');
      setError('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return Promise.resolve(null);
    }

    setStatus('REQUESTING');
    setError(null);

    return new Promise<GeoCoordinates | null>((resolve) => {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoords: GeoCoordinates = {
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
          };

          if (!isValidCoordinates(nextCoords)) {
            setStatus('DENIED');
            setError('Tọa độ GPS nhận được không hợp lệ.');
            resolve(null);
            return;
          }

          setCoordinates(nextCoords);
          setStatus('GRANTED');
          setError(null);
          resolve(nextCoords);
        },
        (geoError) => {
          setStatus('DENIED');
          setError(formatGeolocationError(geoError));
          resolve(null);
        },
        {
          enableHighAccuracy,
          timeout: timeoutMs,
          maximumAge: maximumAgeMs,
        },
      );
    });
  }, [enableHighAccuracy, maximumAgeMs, setCoordinates, timeoutMs]);

  const useDefaultLocation = useCallback(
    (preset: DefaultCityPreset = 'HANOI'): GeoCoordinates => {
      const selected = DEFAULT_CITY_LOCATIONS[preset] ?? DEFAULT_CITY_LOCATIONS.HANOI;
      const fallbackCoords: GeoCoordinates = {
        latitude: selected.latitude,
        longitude: selected.longitude,
      };
      setCoordinates(fallbackCoords);
      setStatus('FALLBACK');
      setError(null);
      return fallbackCoords;
    },
    [setCoordinates],
  );

  const setCustomLocation = useCallback(
    (coords: GeoCoordinates): boolean => {
      if (!isValidCoordinates(coords)) {
        setError('Vĩ độ phải trong khoảng [-90, 90] và kinh độ trong khoảng [-180, 180].');
        return false;
      }
      setCoordinates({
        latitude: Number(coords.latitude.toFixed(6)),
        longitude: Number(coords.longitude.toFixed(6)),
      });
      setStatus('FALLBACK');
      setError(null);
      return true;
    },
    [setCoordinates],
  );

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setStatus('IDLE');
    setError(null);
  }, [setCoordinates]);

  const getDistanceFromMeKm = useCallback(
    (target: GeoCoordinates | null | undefined): number | undefined => {
      return getPlaceDistanceKm(coordinates, target);
    },
    [coordinates],
  );

  useEffect(() => {
    if (!autoRequest || autoRequestedRef.current || isValidCoordinates(coordinates)) {
      return;
    }
    autoRequestedRef.current = true;
    const timerId = window.setTimeout(() => {
      void requestLocation();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [autoRequest, coordinates, requestLocation]);

  return {
    coordinates,
    hasCoordinates: isValidCoordinates(coordinates),
    status,
    isRequesting: status === 'REQUESTING',
    error,
    requestLocation,
    useDefaultLocation,
    setCustomLocation,
    clearLocation,
    getDistanceFromMeKm,
  };
}

export default useGeolocation;
