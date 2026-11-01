// Dịch vụ tìm kiếm, lọc và quản trị địa điểm ăn uống
import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';
import type {
  PlaceCreationRequest,
  PlaceFilterParams,
  PlaceResponse,
  PlaceUpdateRequest,
  UUID,
} from '../types';

const PLACES_BASE_PATH = '/api/v1/places';

// Chuẩn hóa query params theo thứ tự ưu tiên của PlaceController: GPS -> name -> category
export function buildPlaceFilterParams(params?: PlaceFilterParams): PlaceFilterParams | undefined {
  if (!params) return undefined;
  const trimmedName = params.name?.trim();
  const trimmedCategory = params.category?.trim();

  if (typeof params.latitude === 'number' && typeof params.longitude === 'number') {
    return {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius ?? 5.0,
      ...(trimmedCategory ? { category: trimmedCategory } : {}),
    };
  }
  if (trimmedName) {
    return { name: trimmedName };
  }
  if (trimmedCategory) {
    return { category: trimmedCategory };
  }
  return undefined;
}

export function getPlaces(params?: PlaceFilterParams): Promise<PlaceResponse[]> {
  return apiGet<PlaceResponse[]>(PLACES_BASE_PATH, {
    params: buildPlaceFilterParams(params),
  });
}

export function getPlaceById(placeId: UUID): Promise<PlaceResponse> {
  return apiGet<PlaceResponse>(`${PLACES_BASE_PATH}/${encodeURIComponent(placeId)}`);
}

export const getPlace = getPlaceById;

export function createPlace(payload: PlaceCreationRequest): Promise<PlaceResponse> {
  return apiPost<PlaceResponse, PlaceCreationRequest>(PLACES_BASE_PATH, payload);
}

export function updatePlace(placeId: UUID, payload: PlaceUpdateRequest): Promise<PlaceResponse> {
  return apiPut<PlaceResponse, PlaceUpdateRequest>(
    `${PLACES_BASE_PATH}/${encodeURIComponent(placeId)}`,
    payload,
  );
}

export function deletePlace(placeId: UUID): Promise<string> {
  return apiDelete<string>(`${PLACES_BASE_PATH}/${encodeURIComponent(placeId)}`);
}

export const placeService = {
  buildPlaceFilterParams,
  getPlaces,
  getPlaceById,
  getPlace,
  createPlace,
  updatePlace,
  deletePlace,
};

export default placeService;
