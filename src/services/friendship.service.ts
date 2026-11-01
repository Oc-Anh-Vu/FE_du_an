// Dịch vụ quản lý bạn bè và lời mời kết bạn
import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';
import type { FriendshipResponse, UUID, UserResponse } from '../types';

const FRIENDSHIPS_BASE_PATH = '/api/v1/friendships';

export function getFriends(): Promise<UserResponse[]> {
  return apiGet<UserResponse[]>(FRIENDSHIPS_BASE_PATH);
}

export function getIncomingFriendRequests(): Promise<FriendshipResponse[]> {
  return apiGet<FriendshipResponse[]>(`${FRIENDSHIPS_BASE_PATH}/requests/incoming`);
}

export const getPendingIncomingRequests = getIncomingFriendRequests;

export function getOutgoingFriendRequests(): Promise<FriendshipResponse[]> {
  return apiGet<FriendshipResponse[]>(`${FRIENDSHIPS_BASE_PATH}/requests/outgoing`);
}

export const getPendingOutgoingRequests = getOutgoingFriendRequests;

export function sendFriendRequest(addresseeId: UUID): Promise<FriendshipResponse> {
  return apiPost<FriendshipResponse, undefined>(
    `${FRIENDSHIPS_BASE_PATH}/requests/${encodeURIComponent(addresseeId)}`,
  );
}

export function acceptFriendRequest(requesterId: UUID): Promise<FriendshipResponse> {
  return apiPut<FriendshipResponse, undefined>(
    `${FRIENDSHIPS_BASE_PATH}/requests/${encodeURIComponent(requesterId)}/accept`,
  );
}

export function removeFriendship(targetUserId: UUID): Promise<string> {
  return apiDelete<string>(`${FRIENDSHIPS_BASE_PATH}/${encodeURIComponent(targetUserId)}`);
}

export const declineOrRemoveFriendship = removeFriendship;

export const friendshipService = {
  getFriends,
  getIncomingFriendRequests,
  getPendingIncomingRequests,
  getOutgoingFriendRequests,
  getPendingOutgoingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
  declineOrRemoveFriendship,
};

export default friendshipService;
