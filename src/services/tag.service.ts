// Dịch vụ quản lý Tags hệ thống và Tags sở thích cá nhân/tạm thời
import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';
import type { TagRequest, TagResponse, UUID, UserTagResponse } from '../types';

const TAGS_BASE_PATH = '/api/v1/tags';
const USER_TAGS_BASE_PATH = '/api/v1/tags/user/me';

// --- 1. Tags hệ thống ---

export function createTag(payload: TagRequest): Promise<TagResponse> {
  return apiPost<TagResponse, TagRequest>(TAGS_BASE_PATH, payload);
}

export function getAllTags(): Promise<TagResponse[]> {
  return apiGet<TagResponse[]>(TAGS_BASE_PATH);
}

export const getTags = getAllTags;

export function getTagById(id: UUID): Promise<TagResponse> {
  return apiGet<TagResponse>(`${TAGS_BASE_PATH}/${encodeURIComponent(id)}`);
}

export const getTag = getTagById;

export function updateTag(id: UUID, payload: TagRequest): Promise<TagResponse> {
  return apiPut<TagResponse, TagRequest>(`${TAGS_BASE_PATH}/${encodeURIComponent(id)}`, payload);
}

export function deleteTag(id: UUID): Promise<string> {
  return apiDelete<string>(`${TAGS_BASE_PATH}/${encodeURIComponent(id)}`);
}

// --- 2. Tags sở thích cá nhân & tạm thời ---

export function getUserTags(): Promise<UserTagResponse[]> {
  return apiGet<UserTagResponse[]>(USER_TAGS_BASE_PATH);
}

export const getMyTags = getUserTags;

export function addUserTag(tagId: UUID, temporary = false): Promise<UserTagResponse> {
  return apiPost<UserTagResponse, undefined>(
    `${USER_TAGS_BASE_PATH}/${encodeURIComponent(tagId)}`,
    undefined,
    { params: { temporary } },
  );
}

export function updateUserTag(tagId: UUID, temporary: boolean): Promise<UserTagResponse> {
  return apiPut<UserTagResponse, undefined>(
    `${USER_TAGS_BASE_PATH}/${encodeURIComponent(tagId)}`,
    undefined,
    { params: { temporary } },
  );
}

export function removeUserTag(tagId: UUID): Promise<string> {
  return apiDelete<string>(`${USER_TAGS_BASE_PATH}/${encodeURIComponent(tagId)}`);
}

export const tagService = {
  createTag,
  getAllTags,
  getTags,
  getTagById,
  getTag,
  updateTag,
  deleteTag,
  getUserTags,
  getMyTags,
  addUserTag,
  updateUserTag,
  removeUserTag,
};

export default tagService;
