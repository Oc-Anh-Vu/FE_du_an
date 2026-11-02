import { useCallback, useState } from 'react';
import type {
  PlaceCreationRequest,
  PlaceResponse,
  PlaceUpdateRequest,
  TagRequest,
  TagResponse,
  UUID,
  UserResponse,
  UserUpdateRequest,
} from '../../types';
import { ApiErrorCode } from '../../types';
import { userService } from '../../services/user.service';
import { placeService } from '../../services/place.service';
import { tagService } from '../../services/tag.service';
import { useUIStore } from '../../store/uiStore';

export interface AdminOverviewData {
  totalUsers: number;
  totalPlaces: number;
  totalTags: number;
  adminCount: number;
}

export interface UseAdminActionsReturn {
  overviewStats: AdminOverviewData | null;
  users: UserResponse[];
  places: PlaceResponse[];
  tags: TagResponse[];
  isLoading: boolean;
  error: string | null;
  fetchAdminOverview: () => Promise<AdminOverviewData | null>;
  fetchAllUsers: () => Promise<UserResponse[]>;
  updateUserByAdmin: (userId: UUID, payload: UserUpdateRequest) => Promise<UserResponse | null>;
  deleteUserByAdmin: (userId: UUID) => Promise<boolean>;
  fetchAllPlaces: () => Promise<PlaceResponse[]>;
  createPlaceByAdmin: (payload: PlaceCreationRequest) => Promise<PlaceResponse | null>;
  updatePlaceByAdmin: (placeId: UUID, payload: PlaceUpdateRequest) => Promise<PlaceResponse | null>;
  deletePlaceByAdmin: (placeId: UUID) => Promise<boolean>;
  fetchAllSystemTags: () => Promise<TagResponse[]>;
  createSystemTag: (payload: TagRequest) => Promise<TagResponse | null>;
  updateSystemTag: (tagId: UUID, payload: TagRequest) => Promise<TagResponse | null>;
  deleteSystemTag: (tagId: UUID) => Promise<boolean>;
  clearError: () => void;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error && typeof error === 'object') {
    const err = error as { code?: number; message?: string; status?: number };
    if (err.code === ApiErrorCode.CANNOT_DELETE_ADMIN) {
      return 'Không thể xóa tài khoản Quản trị viên (Admin) hệ thống.';
    }
    if (err.code === ApiErrorCode.CANNOT_ASSIGN_ADMIN_ROLE) {
      return 'Không thể tự ý gán quyền Quản trị viên cho tài khoản khác.';
    }
    if (err.code === ApiErrorCode.TAG_ALREADY_EXISTS) {
      return 'Tên Tag đã tồn tại trên hệ thống.';
    }
    if (err.code === ApiErrorCode.TAG_NOT_FOUND) {
      return 'Không tìm thấy Tag tương ứng.';
    }
    if (err.code === ApiErrorCode.PLACE_NOT_FOUND) {
      return 'Không tìm thấy địa điểm tương ứng.';
    }
    if (err.code === ApiErrorCode.PLACE_NAME_INVALID) {
      return 'Tên địa điểm không hợp lệ.';
    }
    if (err.code === ApiErrorCode.USER_NOT_EXISTED) {
      return 'Không tìm thấy người dùng.';
    }
    if (err.message) {
      return err.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}

export function useAdminActions(): UseAdminActionsReturn {
  const [overviewStats, setOverviewStats] = useState<AdminOverviewData | null>(null);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** Lấy thống kê KPI tổng quan hệ thống */
  const fetchAdminOverview = useCallback(async (): Promise<AdminOverviewData | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, placesData, tagsData] = await Promise.all([
        userService.getUsers().catch(() => []),
        placeService.getPlaces().catch(() => []),
        tagService.getAllTags().catch(() => []),
      ]);

      const validUsers = Array.isArray(usersData) ? usersData : [];
      const validPlaces = Array.isArray(placesData) ? placesData : [];
      const validTags = Array.isArray(tagsData) ? tagsData : [];

      const adminCount = validUsers.filter((u) =>
        u.roles.some((r) => r === 'ROLE_ADMIN' || r === 'ADMIN'),
      ).length;

      const stats: AdminOverviewData = {
        totalUsers: validUsers.length,
        totalPlaces: validPlaces.length,
        totalTags: validTags.length,
        adminCount,
      };

      setOverviewStats(stats);
      setUsers(validUsers);
      setPlaces(validPlaces);
      setTags(validTags);

      return stats;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải số liệu thống kê tổng quan.');
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Lấy toàn bộ người dùng */
  const fetchAllUsers = useCallback(async (): Promise<UserResponse[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.getUsers();
      const valid = Array.isArray(result) ? result : [];
      setUsers(valid);
      return valid;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải danh sách người dùng.');
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Cập nhật thông tin người dùng */
  const updateUserByAdmin = useCallback(
    async (userId: UUID, payload: UserUpdateRequest): Promise<UserResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await userService.updateUser(userId, payload);
        setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
        useUIStore.getState().showToast('success', 'Đã cập nhật thông tin người dùng thành công!');
        return updated;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể cập nhật người dùng.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /** Xóa người dùng (bảo vệ tài khoản Admin) */
  const deleteUserByAdmin = useCallback(
    async (userId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        // Kiểm tra quyền Admin ở Client trước
        const target = users.find((u) => u.id === userId);
        if (target && target.roles.some((r) => r === 'ROLE_ADMIN' || r === 'ADMIN')) {
          useUIStore.getState().showToast('danger', 'Không thể xóa tài khoản Quản trị viên (Admin).');
          return false;
        }

        await userService.deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        useUIStore.getState().showToast('info', 'Đã xóa người dùng khỏi hệ thống.');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể xóa người dùng.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [users],
  );

  /** Lấy toàn bộ địa điểm */
  const fetchAllPlaces = useCallback(async (): Promise<PlaceResponse[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await placeService.getPlaces();
      const valid = Array.isArray(result) ? result : [];
      setPlaces(valid);
      return valid;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải danh sách địa điểm.');
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Thêm địa điểm mới */
  const createPlaceByAdmin = useCallback(
    async (payload: PlaceCreationRequest): Promise<PlaceResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const created = await placeService.createPlace(payload);
        setPlaces((prev) => [created, ...prev]);
        useUIStore.getState().showToast('success', 'Đã thêm địa điểm ăn uống mới!');
        return created;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể thêm địa điểm.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /** Cập nhật địa điểm */
  const updatePlaceByAdmin = useCallback(
    async (placeId: UUID, payload: PlaceUpdateRequest): Promise<PlaceResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await placeService.updatePlace(placeId, payload);
        setPlaces((prev) => prev.map((p) => (p.id === placeId ? updated : p)));
        useUIStore.getState().showToast('success', 'Đã cập nhật thông tin địa điểm!');
        return updated;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể cập nhật địa điểm.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /** Xóa địa điểm */
  const deletePlaceByAdmin = useCallback(
    async (placeId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await placeService.deletePlace(placeId);
        setPlaces((prev) => prev.filter((p) => p.id !== placeId));
        useUIStore.getState().showToast('info', 'Đã xóa địa điểm.');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể xóa địa điểm.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /** Lấy toàn bộ Tags hệ thống */
  const fetchAllSystemTags = useCallback(async (): Promise<TagResponse[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tagService.getAllTags();
      const valid = Array.isArray(result) ? result : [];
      setTags(valid);
      return valid;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải danh sách Tag hệ thống.');
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Thêm Tag hệ thống mới */
  const createSystemTag = useCallback(
    async (payload: TagRequest): Promise<TagResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const created = await tagService.createTag(payload);
        setTags((prev) => [created, ...prev]);
        useUIStore.getState().showToast('success', 'Đã thêm Tag hệ thống mới!');
        return created;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tạo Tag mới.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /** Cập nhật Tag */
  const updateSystemTag = useCallback(
    async (tagId: UUID, payload: TagRequest): Promise<TagResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await tagService.updateTag(tagId, payload);
        setTags((prev) => prev.map((t) => (t.id === tagId ? updated : t)));
        useUIStore.getState().showToast('success', 'Đã cập nhật Tag hệ thống!');
        return updated;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể cập nhật Tag.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /** Xóa Tag */
  const deleteSystemTag = useCallback(
    async (tagId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await tagService.deleteTag(tagId);
        setTags((prev) => prev.filter((t) => t.id !== tagId));
        useUIStore.getState().showToast('info', 'Đã xóa Tag hệ thống.');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể xóa Tag.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    overviewStats,
    users,
    places,
    tags,
    isLoading,
    error,
    fetchAdminOverview,
    fetchAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
    fetchAllPlaces,
    createPlaceByAdmin,
    updatePlaceByAdmin,
    deletePlaceByAdmin,
    fetchAllSystemTags,
    createSystemTag,
    updateSystemTag,
    deleteSystemTag,
    clearError,
  };
}

export default useAdminActions;
