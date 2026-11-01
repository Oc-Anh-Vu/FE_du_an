// Khung store quản lý phòng ăn, bộ bài (deck), lịch sử quẹt và kết quả bình chọn
import { create } from 'zustand';
import type {
  PlaceResponse,
  RoomResponse,
  RoomStatus,
  RoomSwipeResultItem,
  UserSwipeHistoryItem,
} from '../types';

export interface RoomStoreData {
  currentRoom: RoomResponse | null;
  roomDeck: PlaceResponse[];
  activeRooms: RoomResponse[];
  mySwipes: UserSwipeHistoryItem[];
  swipeResults: RoomSwipeResultItem[];
}

export interface RoomStoreState extends RoomStoreData {
  setCurrentRoom: (room: RoomResponse | null) => void;
  updateCurrentRoomStatus: (status: RoomStatus, matchedPlace?: PlaceResponse | null) => void;
  setRoomDeck: (deck: PlaceResponse[]) => void;
  setActiveRooms: (rooms: RoomResponse[]) => void;
  setMySwipes: (swipes: UserSwipeHistoryItem[]) => void;
  addMySwipe: (swipe: UserSwipeHistoryItem) => void;
  setSwipeResults: (results: RoomSwipeResultItem[]) => void;
  resetRoomStore: () => void;
}

export const initialRoomState: RoomStoreData = {
  currentRoom: null,
  roomDeck: [],
  activeRooms: [],
  mySwipes: [],
  swipeResults: [],
};

export const useRoomStore = create<RoomStoreState>(() => ({
  ...initialRoomState,
  setCurrentRoom: () => {
    // coming soon
  },
  updateCurrentRoomStatus: () => {
    // coming soon
  },
  setRoomDeck: () => {
    // coming soon
  },
  setActiveRooms: () => {
    // coming soon
  },
  setMySwipes: () => {
    // coming soon
  },
  addMySwipe: () => {
    // coming soon
  },
  setSwipeResults: () => {
    // coming soon
  },
  resetRoomStore: () => {
    // coming soon
  },
}));

export default useRoomStore;
