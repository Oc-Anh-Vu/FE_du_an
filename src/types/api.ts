// --- 0. Kiểu cơ sở, Enums & Wrapper phản hồi ---

export type UUID = string;
export type ISODateTimeString = string;
export type PriceRange = 1 | 2 | 3;

/** Wrapper phản hồi chuẩn từ Backend (`ApiResponse.java`) */
export interface ApiResponse<T = unknown> {
  code: number;
  message?: string;
  result: T;
}

/** Phản hồi lỗi từ Backend (`GlobalExceptionHandler.java`) */
export interface ApiErrorResponse {
  code: number;
  message: string;
}

/** Đối tượng lỗi chuẩn hóa tại `src/services/apiClient.ts` */
export interface ApiError {
  status: number;
  code: ApiErrorCodeValue | number;
  message: string;
  raw?: unknown;
}

export const Role = {
  ROLE_GUEST: 'ROLE_GUEST',
  ROLE_USER: 'ROLE_USER',
  ROLE_ADMIN: 'ROLE_ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];
export type RoleInput = Role | 'GUEST' | 'USER' | 'ADMIN' | string;

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const FriendshipStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  BLOCKED: 'BLOCKED',
  DECLINED: 'DECLINED',
} as const;
export type FriendshipStatus = (typeof FriendshipStatus)[keyof typeof FriendshipStatus];

export const RoomStatus = {
  OPEN: 'OPEN',
  SWIPING: 'SWIPING',
  CLOSED: 'CLOSED',
} as const;
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export const SplitType = {
  EVENLY: 'EVENLY',
  BY_ITEM: 'BY_ITEM',
} as const;
export type SplitType = (typeof SplitType)[keyof typeof SplitType];

export const ExpenseStatus = {
  UNPAID: 'UNPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  FULLY_PAID: 'FULLY_PAID',
} as const;
export type ExpenseStatus = (typeof ExpenseStatus)[keyof typeof ExpenseStatus];

// --- 1. Bảng mã lỗi tập trung (`ErrorCode.java`) ---

export const ApiErrorCode = {
  SUCCESS: 1000,

  // Hệ thống chung
  UNCATEGORIZED_EXCEPTION: 9999,
  INVALID_KEY: 1001,

  // Xác thực & Phân quyền (1002 - 1009)
  UNAUTHENTICATED: 1002,
  UNAUTHORIZED: 1003,
  USER_NOT_EXISTED: 1004,
  USER_EXISTED: 1005,
  LOGIN_FAILED: 1006,
  CANNOT_DELETE_ADMIN: 1007,
  CANNOT_ASSIGN_ADMIN_ROLE: 1008,
  INVALID_OTP: 1009,

  // Validation đầu vào (1101 - 1104)
  USERNAME_INVALID: 1101,
  PASSWORD_INVALID: 1102,
  EMAIL_INVALID: 1103,
  INVALID_ROLE: 1104,

  // Địa điểm (1201 - 1206)
  PLACE_NOT_FOUND: 1201,
  PLACE_NAME_INVALID: 1202,
  PLACE_LATITUDE_INVALID: 1203,
  PLACE_LONGITUDE_INVALID: 1204,
  PLACE_NOT_IN_ROOM_DECK: 1205,
  NO_PLACES_NEARBY: 1206,

  // Bạn bè & Tags (1301 - 1307)
  FRIENDSHIP_ALREADY_EXISTS: 1301,
  FRIENDSHIP_NOT_FOUND: 1302,
  CANNOT_FRIEND_SELF: 1303,
  TAG_ALREADY_EXISTS: 1304,
  TAG_NOT_FOUND: 1305,
  CANNOT_BLOCK_SELF: 1306,
  CANNOT_FRIEND_ADMIN: 1307,

  // Phòng ăn & Quẹt thẻ (2001 - 2014)
  ROOM_NOT_FOUND: 2001,
  ROOM_FULL: 2002,
  ROOM_CLOSED: 2003,
  NOT_ROOM_HOST: 2004,
  ROOM_NOT_OPEN: 2005,
  USER_ALREADY_IN_ROOM: 2006,
  NOT_ROOM_MEMBER: 2007,
  ROOM_NOT_SWIPING: 2008,
  ROOM_BUSY: 2009,
  CANNOT_KICK_SELF: 2010,
  ROOM_ALREADY_CLOSED: 2011,
  ROOM_LOCATION_NOT_SET: 2012,
  CANNOT_CHANGE_PLACE_AFTER_EXPENSE: 2013,
  ALREADY_SWIPED: 2014,

  // Tài chính & Chia tiền (3001 - 3010)
  EXPENSE_NOT_FOUND: 3001,
  BILL_AMOUNT_MISMATCH: 3002,
  ROOM_NOT_CLOSED: 3003,
  EXPENSE_ALREADY_EXISTS: 3004,
  SPLIT_NOT_FOUND: 3005,
  ALREADY_PAID: 3006,
  NOT_EXPENSE_PAYER: 3007,
  INVALID_SPLIT_TYPE: 3008,
  SHARER_NOT_IN_ROOM: 3009,
  PAYER_NOT_IN_ROOM: 3010,

  // Dịch vụ bên ngoài & Xóa hóa đơn (4001 - 4002)
  EXTERNAL_SERVICE_ERROR: 4001,
  CANNOT_DELETE_PAID_EXPENSE: 4002,
} as const;

export type ApiErrorCodeKey = keyof typeof ApiErrorCode;
export type ApiErrorCodeValue = (typeof ApiErrorCode)[ApiErrorCodeKey];

// --- 2. Auth (`/api/v1/auth`) ---

export interface AuthenticationRequest {
  username: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
  authenticated: boolean;
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  valid: boolean;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// --- 3. Users (`/api/v1/users`) ---

export interface UserCreationRequest {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
}
export type CreateUserRequest = UserCreationRequest;

export interface UserUpdateRequest {
  password?: string;
  email?: string;
  avatarUrl?: string | null;
  bankBin?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  roles?: RoleInput[];
}
export type UpdateUserRequest = UserUpdateRequest;

export interface UserResponse {
  id: UUID;
  username: string;
  email: string;
  avatarUrl: string | null;
  bankBin?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  status: UserStatus;
  createdAt: ISODateTimeString;
  roles: (Role | string)[];
}

// --- 4. Places (`/api/v1/places`) ---

export interface PlaceCreationRequest {
  name: string;
  category?: string | null;
  priceRange?: PriceRange | number | null;
  imageUrl?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
}
export type CreatePlaceRequest = PlaceCreationRequest;

export type PlaceUpdateRequest = Partial<PlaceCreationRequest>;
export type UpdatePlaceRequest = PlaceUpdateRequest;

export interface LocationRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface PlaceFilterParams {
  name?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface PlaceResponse {
  id: UUID;
  name: string;
  category: string | null;
  priceRange: PriceRange | number | null;
  imageUrl: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
}

// --- 5. Tags (`/api/v1/tags`) ---

export interface TagRequest {
  tagName: string;
}

export interface UserTagQueryParams {
  temporary?: boolean;
}

export interface TagResponse {
  id: UUID;
  tagName: string;
}

export interface UserTagResponse {
  tag: TagResponse;
  temporary: boolean;
}

// --- 6. Friendships (`/api/v1/friendships`) ---

export interface FriendshipResponse {
  requester: UserResponse;
  addressee: UserResponse;
  status: FriendshipStatus;
  createdAt: ISODateTimeString;
}

// --- 7. Rooms (`/api/v1/rooms`) ---

export interface CreateRoomRequest {
  name?: string;
  latitude: number;
  longitude: number;
  radius?: number;
  deckSize?: number;
}

export interface JoinRoomRequest {
  roomCode: string;
}

export interface SelectPlaceRequest {
  placeId: UUID;
}

export interface RoomResponse {
  id: UUID;
  name: string | null;
  roomCode: string;
  host: UserResponse;
  status: RoomStatus;
  matchedPlace: PlaceResponse | null;
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
  deckSize: number | null;
  createdAt: ISODateTimeString;
  members?: UserResponse[] | null;
}

// --- 8. Swipes (`/api/v1/swipes`) ---

export interface SwipeRequest {
  roomId: UUID;
  placeId: UUID;
  liked: boolean;
}

export interface SwipeResponse {
  placeId: UUID;
  placeName: string;
  liked: boolean;
}
export type UserSwipeHistoryItem = SwipeResponse;

export interface RoomPlaceResultResponse {
  placeId: UUID;
  placeName: string;
  totalLikes: number;
  totalDislikes: number;
  matched: boolean;
}
export type RoomSwipeResultItem = RoomPlaceResultResponse;

export interface MatchResponse {
  match: boolean;
  matchedPlace: PlaceResponse | null;
}

// --- 9. Expenses (`/api/v1/expenses`) ---

export interface ExpenseItemRequest {
  itemName: string;
  price: number;
  sharerIds?: UUID[] | null;
}

export interface ExpenseCreateRequest {
  roomId: UUID;
  payerId: UUID;
  totalAmount: number;
  splitType: SplitType;
  items: ExpenseItemRequest[];
}
export type CreateExpenseRequest = ExpenseCreateRequest;

export interface ExpenseItemResponse {
  id: UUID;
  itemName: string;
  price: number;
  sharerCount: number;
  pricePerPerson: number;
}

export interface ExpenseSplitResponse {
  expenseId: UUID;
  user: UserResponse;
  payer?: UserResponse | null;
  amountOwed: number;
  paid: boolean;
  qrCodeUrl?: string | null;
}
export type ExpenseSplitItem = ExpenseSplitResponse;

export interface ExpenseResponse {
  id: UUID;
  room: RoomResponse;
  payer: UserResponse;
  totalAmount: number;
  splitType: SplitType;
  status: ExpenseStatus;
  createdAt: ISODateTimeString;
  items: ExpenseItemResponse[];
  splits: ExpenseSplitResponse[];
  fullyPaid: boolean;
}
