// Dịch vụ gửi lượt quẹt thẻ nhóm và truy xuất kết quả bầu chọn
import { apiGet, apiPost } from './apiClient';
import type { RoomPlaceResultResponse, SwipeRequest, SwipeResponse, UUID } from '../types';

const SWIPES_BASE_PATH = '/api/v1/swipes';

export function swipe(payload: SwipeRequest): Promise<void> {
  return apiPost<void, SwipeRequest>(SWIPES_BASE_PATH, payload);
}

export const submitSwipe = swipe;

export function getMySwipesInRoom(roomId: UUID): Promise<SwipeResponse[]> {
  return apiGet<SwipeResponse[]>(`${SWIPES_BASE_PATH}/rooms/${encodeURIComponent(roomId)}/me`);
}

export const getMySwipes = getMySwipesInRoom;

export function getRoomSwipeResults(roomId: UUID): Promise<RoomPlaceResultResponse[]> {
  return apiGet<RoomPlaceResultResponse[]>(
    `${SWIPES_BASE_PATH}/rooms/${encodeURIComponent(roomId)}/results`,
  );
}

export const getSwipeResults = getRoomSwipeResults;

export const swipeService = {
  swipe,
  submitSwipe,
  getMySwipesInRoom,
  getMySwipes,
  getRoomSwipeResults,
  getSwipeResults,
};

export default swipeService;
