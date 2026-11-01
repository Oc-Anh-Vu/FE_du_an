// Store quản lý trạng thái phòng ăn, bộ bài (roomDeck), lịch sử quẹt và kết quả bình chọn (FE_SPEC.md Mục 5.2)
import { create } from 'zustand';
import {
  RoomStatus,
  type PlaceResponse,
  type RoomResponse,
  type RoomSwipeResultItem,
  type UserSwipeHistoryItem,
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

export const useRoomStore = create<RoomStoreState>((set) => ({
  ...initialRoomState,

  setCurrentRoom: (room) =>
    set((state) => {
      if (!room) {
        return { currentRoom: null };
      }
      // Đồng bộ danh sách activeRooms nếu phòng hiện tại nằm trong danh sách
      const existsInActive = state.activeRooms.some((item) => item.id === room.id);
      const nextActiveRooms =
        room.status === RoomStatus.CLOSED
          ? state.activeRooms.filter((item) => item.id !== room.id)
          : existsInActive
            ? state.activeRooms.map((item) => (item.id === room.id ? { ...item, ...room } : item))
            : state.activeRooms;

      return {
        currentRoom: room,
        activeRooms: nextActiveRooms,
      };
    }),

  updateCurrentRoomStatus: (status, matchedPlace) =>
    set((state) => {
      if (!state.currentRoom) {
        return state;
      }
      const updatedRoom: RoomResponse = {
        ...state.currentRoom,
        status,
        ...(matchedPlace !== undefined ? { matchedPlace } : {}),
      };
      const nextActiveRooms =
        status === RoomStatus.CLOSED
          ? state.activeRooms.filter((item) => item.id !== updatedRoom.id)
          : state.activeRooms.map((item) => (item.id === updatedRoom.id ? updatedRoom : item));

      return {
        currentRoom: updatedRoom,
        activeRooms: nextActiveRooms,
      };
    }),

  setRoomDeck: (deck) =>
    set({
      roomDeck: Array.isArray(deck) ? deck : [],
    }),

  setActiveRooms: (rooms) =>
    set({
      activeRooms: Array.isArray(rooms) ? rooms : [],
    }),

  setMySwipes: (swipes) =>
    set({
      mySwipes: Array.isArray(swipes) ? swipes : [],
    }),

  addMySwipe: (swipe) =>
    set((state) => {
      const existingIndex = state.mySwipes.findIndex((item) => item.placeId === swipe.placeId);
      if (existingIndex === -1) {
        return {
          mySwipes: [...state.mySwipes, swipe],
        };
      }
      const updated = [...state.mySwipes];
      updated[existingIndex] = swipe;
      return {
        mySwipes: updated,
      };
    }),

  setSwipeResults: (results) =>
    set({
      swipeResults: Array.isArray(results) ? results : [],
    }),

  resetRoomStore: () =>
    set({
      ...initialRoomState,
    }),
}));

export default useRoomStore;
