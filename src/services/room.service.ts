// Dịch vụ quản lý phòng ăn, thành viên và bộ bài quẹt
import { apiDelete, apiGet, apiPost } from './apiClient';
import type {
  CreateRoomRequest,
  PlaceResponse,
  RoomResponse,
  SelectPlaceRequest,
  UUID,
} from '../types';

const ROOMS_BASE_PATH = '/api/v1/rooms';

export function createRoom(payload: CreateRoomRequest): Promise<RoomResponse> {
  return apiPost<RoomResponse, CreateRoomRequest>(ROOMS_BASE_PATH, payload);
}

export function joinRoom(roomCode: string): Promise<RoomResponse> {
  const normalizedCode = roomCode.trim().toUpperCase();
  return apiPost<RoomResponse, undefined>(
    `${ROOMS_BASE_PATH}/join/${encodeURIComponent(normalizedCode)}`,
  );
}

export function getMyRooms(): Promise<RoomResponse[]> {
  return apiGet<RoomResponse[]>(`${ROOMS_BASE_PATH}/my-rooms`);
}

export function getRoomDetails(roomId: UUID): Promise<RoomResponse> {
  return apiGet<RoomResponse>(`${ROOMS_BASE_PATH}/${encodeURIComponent(roomId)}`);
}

export const getRoomById = getRoomDetails;

export function generateDeck(roomId: UUID): Promise<PlaceResponse[]> {
  return apiPost<PlaceResponse[], undefined>(`${ROOMS_BASE_PATH}/${encodeURIComponent(roomId)}/deck`);
}

export const generateOrGetDeck = generateDeck;

export function getDeck(roomId: UUID): Promise<PlaceResponse[]> {
  return apiGet<PlaceResponse[]>(`${ROOMS_BASE_PATH}/${encodeURIComponent(roomId)}/deck`);
}

export const getRoomDeck = getDeck;

export function startSwiping(roomId: UUID): Promise<void> {
  return apiPost<void, undefined>(`${ROOMS_BASE_PATH}/${encodeURIComponent(roomId)}/start`);
}

export const startRoom = startSwiping;

export function selectPlace(
  roomId: UUID,
  payload: SelectPlaceRequest | UUID,
): Promise<RoomResponse> {
  const body: SelectPlaceRequest = typeof payload === 'string' ? { placeId: payload } : payload;
  return apiPost<RoomResponse, SelectPlaceRequest>(
    `${ROOMS_BASE_PATH}/${encodeURIComponent(roomId)}/select-place`,
    body,
  );
}

export function closeRoom(roomId: UUID): Promise<void> {
  return apiPost<void, undefined>(`${ROOMS_BASE_PATH}/${encodeURIComponent(roomId)}/close`);
}

export function leaveRoom(roomId: UUID): Promise<string> {
  return apiDelete<string>(`${ROOMS_BASE_PATH}/${encodeURIComponent(roomId)}/leave`);
}

export function kickMember(roomId: UUID, memberUserId: UUID): Promise<string> {
  return apiDelete<string>(
    `${ROOMS_BASE_PATH}/${encodeURIComponent(roomId)}/members/${encodeURIComponent(memberUserId)}`,
  );
}

export function deleteRoom(roomId: UUID): Promise<string> {
  return apiDelete<string>(`${ROOMS_BASE_PATH}/${encodeURIComponent(roomId)}`);
}

export const roomService = {
  createRoom,
  joinRoom,
  getMyRooms,
  getRoomDetails,
  getRoomById,
  generateDeck,
  generateOrGetDeck,
  getDeck,
  getRoomDeck,
  startSwiping,
  startRoom,
  selectPlace,
  closeRoom,
  leaveRoom,
  kickMember,
  deleteRoom,
};

export default roomService;
