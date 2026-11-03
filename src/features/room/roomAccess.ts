import { ApiErrorCode } from '../../types';

export function isRoomAccessError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const { code, status } = error as { code?: number; status?: number };
  return code === ApiErrorCode.ROOM_NOT_FOUND ||
    code === ApiErrorCode.NOT_ROOM_MEMBER || status === 403 || status === 404;
}
