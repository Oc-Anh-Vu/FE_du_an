import { normalizeApiError } from "../../services/apiClient";
import { ApiErrorCode } from "../../types";

const errorMessages: Partial<Record<number, string>> = {
  [ApiErrorCode.UNAUTHENTICATED]: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  [ApiErrorCode.UNAUTHORIZED]: "Tài khoản hiện tại không có quyền thực hiện thao tác này.",
  [ApiErrorCode.USER_NOT_EXISTED]: "Không tìm thấy người dùng.",
  [ApiErrorCode.CANNOT_DELETE_ADMIN]: "Không thể xóa tài khoản Admin hệ thống.",
  [ApiErrorCode.CANNOT_ASSIGN_ADMIN_ROLE]: "Không thể gán quyền Admin cho tài khoản khác.",
  [ApiErrorCode.INVALID_ROLE]: "Vai trò người dùng không hợp lệ.",
  [ApiErrorCode.PLACE_NOT_FOUND]: "Không tìm thấy địa điểm.",
  [ApiErrorCode.PLACE_NAME_INVALID]: "Tên địa điểm không hợp lệ.",
  [ApiErrorCode.PLACE_LATITUDE_INVALID]: "Vĩ độ phải nằm trong khoảng -90 đến 90.",
  [ApiErrorCode.PLACE_LONGITUDE_INVALID]: "Kinh độ phải nằm trong khoảng -180 đến 180.",
  [ApiErrorCode.TAG_ALREADY_EXISTS]: "Tên Tag đã tồn tại.",
  [ApiErrorCode.TAG_NOT_FOUND]: "Không tìm thấy Tag.",
};

export function getAdminErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);
  return errorMessages[apiError.code] ?? apiError.message;
}

export function formatAdminDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
