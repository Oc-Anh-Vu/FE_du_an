import { useCallback, useState } from 'react';
import type { FriendshipResponse, UserResponse, UUID } from '../../types';
import { ApiErrorCode, UserStatus } from '../../types';
import { friendshipService } from '../../services/friendship.service';
import { userService } from '../../services/user.service';
import { useUIStore } from '../../store/uiStore';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export interface UseSocialActionsReturn {
  friends: UserResponse[];
  incomingRequests: FriendshipResponse[];
  outgoingRequests: FriendshipResponse[];
  isLoading: boolean;
  error: string | null;
  searchResults: UserResponse[];
  isSearching: boolean;
  searchError: string | null;
  isSearchForbidden: boolean;
  fetchAllSocialData: () => Promise<void>;
  sendRequest: (addresseeId: UUID) => Promise<boolean>;
  acceptRequest: (requesterId: UUID) => Promise<boolean>;
  removeOrDecline: (targetUserId: UUID) => Promise<boolean>;
  searchUsersOrFallbackByUuid: (query: string) => Promise<UserResponse[]>;
  clearSearchResults: () => void;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error && typeof error === 'object') {
    const err = error as { code?: number; message?: string; status?: number };
    if (err.code === ApiErrorCode.CANNOT_FRIEND_SELF) {
      return 'Không thể gửi lời mời kết bạn cho chính mình.';
    }
    if (err.code === ApiErrorCode.CANNOT_FRIEND_ADMIN) {
      return 'Không thể kết bạn với tài khoản Quản trị viên (Admin).';
    }
    if (err.code === ApiErrorCode.FRIENDSHIP_ALREADY_EXISTS) {
      return 'Lời mời kết bạn đã tồn tại hoặc hai người đã là bạn bè.';
    }
    if (err.code === ApiErrorCode.USER_NOT_EXISTED) {
      return 'Không tìm thấy tài khoản người dùng tương ứng.';
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

export function useSocialActions(): UseSocialActionsReturn {
  const [friends, setFriends] = useState<UserResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendshipResponse[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendshipResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchForbidden, setIsSearchForbidden] = useState<boolean>(false);

  /** Lấy toàn bộ dữ liệu bạn bè, lời mời đến và lời mời đi */
  const fetchAllSocialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [friendsData, incomingData, outgoingData] = await Promise.all([
        friendshipService.getFriends(),
        friendshipService.getIncomingFriendRequests(),
        friendshipService.getOutgoingFriendRequests(),
      ]);

      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setIncomingRequests(Array.isArray(incomingData) ? incomingData : []);
      setOutgoingRequests(Array.isArray(outgoingData) ? outgoingData : []);
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải thông tin bạn bè và lời mời.');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Gửi lời mời kết bạn */
  const sendRequest = useCallback(async (addresseeId: UUID): Promise<boolean> => {
    const trimmedId = addresseeId.trim();
    if (!trimmedId) {
      useUIStore.getState().showToast('warning', 'Vui lòng cung cấp mã ID người dùng.');
      return false;
    }

    try {
      await friendshipService.sendFriendRequest(trimmedId);
      useUIStore.getState().showToast('success', 'Đã gửi lời mời kết bạn thành công!');

      // Cập nhật lại danh sách lời mời đã gửi
      try {
        const updatedOutgoing = await friendshipService.getOutgoingFriendRequests();
        setOutgoingRequests(Array.isArray(updatedOutgoing) ? updatedOutgoing : []);
      } catch {
        // Bỏ qua nếu refresh nền gặp lỗi
      }

      return true;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể gửi lời mời kết bạn.');
      useUIStore.getState().showToast('danger', message);
      return false;
    }
  }, []);

  /** Chấp nhận lời mời kết bạn */
  const acceptRequest = useCallback(async (requesterId: UUID): Promise<boolean> => {
    try {
      await friendshipService.acceptFriendRequest(requesterId);
      useUIStore.getState().showToast('success', 'Đã đồng ý kết bạn thành công!');

      // Cập nhật ngay trên UI và fetch lại để đồng bộ
      setIncomingRequests((prev) => prev.filter((req) => req.requester.id !== requesterId));
      try {
        const [updatedFriends, updatedIncoming] = await Promise.all([
          friendshipService.getFriends(),
          friendshipService.getIncomingFriendRequests(),
        ]);
        setFriends(Array.isArray(updatedFriends) ? updatedFriends : []);
        setIncomingRequests(Array.isArray(updatedIncoming) ? updatedIncoming : []);
      } catch {
        // Fallback UI đã tự lọc
      }

      return true;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể chấp nhận lời mời kết bạn.');
      useUIStore.getState().showToast('danger', message);
      return false;
    }
  }, []);

  /** Hủy kết bạn, từ chối lời mời hoặc thu hồi lời mời đã gửi */
  const removeOrDecline = useCallback(async (targetUserId: UUID): Promise<boolean> => {
    try {
      await friendshipService.removeFriendship(targetUserId);
      useUIStore.getState().showToast('info', 'Đã xóa bạn bè hoặc hủy lời mời thành công.');

      // Loại bỏ khỏi state cục bộ
      setFriends((prev) => prev.filter((friend) => friend.id !== targetUserId));
      setIncomingRequests((prev) => prev.filter((req) => req.requester.id !== targetUserId));
      setOutgoingRequests((prev) => prev.filter((req) => req.addressee.id !== targetUserId));

      return true;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể thực hiện thao tác xóa hoặc hủy.');
      useUIStore.getState().showToast('danger', message);
      return false;
    }
  }, []);

  /** Tìm kiếm người dùng theo tên (hỗ trợ BE query ?name=) hoặc theo UUID */
  const searchUsersOrFallbackByUuid = useCallback(async (query: string): Promise<UserResponse[]> => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchError(null);
      return [];
    }

    setIsSearching(true);
    setSearchError(null);

    const isUuid = UUID_REGEX.test(trimmed);

    try {
      // 1. Gọi userService.getUsers(trimmed) với query name mới của BE
      let results = await userService.getUsers(trimmed);
      setIsSearchForbidden(false);

      // Nếu truyền UUID và kết quả theo tên rỗng, thử tra cứu chính xác theo ID
      if (isUuid && (!results || results.length === 0)) {
        try {
          const directUser = await userService.getUserById(trimmed);
          if (directUser) {
            results = [directUser];
          }
        } catch {
          // Bỏ qua lỗi tra cứu theo ID
        }
      }

      const list = Array.isArray(results) ? results : [];
      setSearchResults(list);
      return list;
    } catch (err) {
      const is403 =
        (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 403) ||
        (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 1003);

      if (is403) {
        setIsSearchForbidden(true);
        if (isUuid) {
          const fallbackUser: UserResponse = {
            id: trimmed,
            username: `Người dùng (${trimmed.slice(0, 8)}...)`,
            email: 'Ẩn do chính sách bảo mật',
            avatarUrl: null,
            status: UserStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            roles: ['ROLE_USER'],
          };
          const fallbackList = [fallbackUser];
          setSearchResults(fallbackList);
          return fallbackList;
        }

        const msg = 'Hệ thống bảo vệ quyền riêng tư người dùng. Vui lòng dán chính xác mã UUID (36 ký tự) để gửi kết bạn.';
        setSearchError(msg);
        setSearchResults([]);
        return [];
      }

      const message = getErrorMessage(err, 'Không thể tìm kiếm người dùng. Vui lòng thử lại.');
      setSearchError(message);
      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    setIsSearchForbidden(false);
  }, []);

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    isLoading,
    error,
    searchResults,
    isSearching,
    searchError,
    isSearchForbidden,
    fetchAllSocialData,
    sendRequest,
    acceptRequest,
    removeOrDecline,
    searchUsersOrFallbackByUuid,
    clearSearchResults,
  };
}

export default useSocialActions;
