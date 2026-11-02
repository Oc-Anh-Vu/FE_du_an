// Dịch vụ ghép hội ngẫu nhiên và tìm phòng công khai (/api/v1/matchmaking)
import { apiDelete, apiGet, apiPost } from './apiClient';
import type {
  MatchmakingRequest,
  MatchmakingStatusResponse,
  PublicRoomResponse,
} from '../types';

const MATCHMAKING_BASE_PATH = '/api/v1/matchmaking';

// Gửi yêu cầu tìm phòng ghép hoặc xếp hàng vào hàng đợi Redis
 
export function findOrQueueMatch(
  request: MatchmakingRequest,
): Promise<MatchmakingStatusResponse> {
  return apiPost<MatchmakingStatusResponse, MatchmakingRequest>(
    `${MATCHMAKING_BASE_PATH}/find`,
    request,
  );
}

// Lấy trạng thái ghép phòng hiện tại của người dùng (dùng cho REST Polling 3000ms)
export function getMatchStatus(): Promise<MatchmakingStatusResponse> {
  return apiGet<MatchmakingStatusResponse>(`${MATCHMAKING_BASE_PATH}/status`);
}

// Hủy yêu cầu tìm kiếm ghép phòng đang chờ
export function cancelMatch(): Promise<string> {
  return apiDelete<string>(`${MATCHMAKING_BASE_PATH}/cancel`);
}

// Lấy danh sách các phòng công khai đang mở ở khu vực lân cận
export function getNearbyPublicRooms(
  latitude: number,
  longitude: number,
  radius?: number,
): Promise<PublicRoomResponse[]> {
  return apiGet<PublicRoomResponse[]>(`${MATCHMAKING_BASE_PATH}/public-rooms`, {
    params: {
      latitude,
      longitude,
      ...(typeof radius === 'number' && radius > 0 ? { radius } : {}),
    },
  });
}

export const matchmakingService = {
  findOrQueueMatch,
  getMatchStatus,
  cancelMatch,
  getNearbyPublicRooms,
};

export default matchmakingService;
