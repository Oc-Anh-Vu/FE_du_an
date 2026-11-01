export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export const EARTH_RADIUS_KM = 6371;

/** Kiểm tra tọa độ hợp lệ: số hữu hạn, latitude ∈ [-90, 90], longitude ∈ [-180, 180] */
export function isValidCoordinates(
  coords: GeoCoordinates | null | undefined,
): coords is GeoCoordinates {
  if (!coords) return false;
  const { latitude, longitude } = coords;
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/** Chuyển đổi độ sang radian */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Tính khoảng cách đường chim bay (Haversine) giữa 2 tọa độ theo đơn vị km. */
export function calculateHaversineDistance(
  from: GeoCoordinates,
  to: GeoCoordinates,
  decimals: number | null = 1,
): number {
  if (!isValidCoordinates(from) || !isValidCoordinates(to)) {
    return 0;
  }

  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  const distanceKm = EARTH_RADIUS_KM * c;

  if (decimals === null) {
    return distanceKm;
  }
  const factor = 10 ** Math.max(0, Math.floor(decimals));
  return Math.round(distanceKm * factor) / factor;
}

/** Alias ngắn gọn cho calculateHaversineDistance */
export const calculateDistanceKm = calculateHaversineDistance;

/** Tính khoảng cách từ người dùng tới địa điểm để truyền trực tiếp vào prop `distanceKm?: number` của `PlaceCard`. */
export function getPlaceDistanceKm(
  userCoords: GeoCoordinates | null | undefined,
  placeCoords: GeoCoordinates | null | undefined,
  decimals = 1,
): number | undefined {
  if (!isValidCoordinates(userCoords) || !isValidCoordinates(placeCoords)) {
    return undefined;
  }
  return calculateHaversineDistance(userCoords, placeCoords, decimals);
}

/** Kiểm tra địa điểm có nằm trong bán kính tìm kiếm (km) tính từ tọa độ người dùng hay không */
export function isWithinRadiusKm(
  from: GeoCoordinates | null | undefined,
  to: GeoCoordinates | null | undefined,
  radiusKm: number,
): boolean {
  if (
    !isValidCoordinates(from) ||
    !isValidCoordinates(to) ||
    !Number.isFinite(radiusKm) ||
    radiusKm < 0
  ) {
    return false;
  }
  return calculateHaversineDistance(from, to, null) <= radiusKm;
}
