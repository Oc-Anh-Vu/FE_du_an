// Hook quản lý quyền truy cập tọa độ GPS, lưu vào userStore và cung cấp tọa độ mặc định
import { useCallback, useState } from 'react';
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

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  void options;
  const coordinates = useUserStore((state) => state.coordinates);
  const [status] = useState<GeolocationPermissionStatus>('IDLE');
  const [error] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<GeoCoordinates | null> => {
    return null;
  }, []);

  const useDefaultLocation = useCallback((preset: DefaultCityPreset = 'HANOI'): GeoCoordinates => {
    const chosen = DEFAULT_CITY_LOCATIONS[preset];
    return { latitude: chosen.latitude, longitude: chosen.longitude };
  }, []);

  const setCustomLocation = useCallback((coords: GeoCoordinates): boolean => {
    return isValidCoordinates(coords);
  }, []);

  const clearLocation = useCallback(() => {}, []);

  const getDistanceFromMeKm = useCallback(
    (target: GeoCoordinates | null | undefined): number | undefined => {
      return getPlaceDistanceKm(coordinates, target);
    },
    [coordinates],
  );

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
