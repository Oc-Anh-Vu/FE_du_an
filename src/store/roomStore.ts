// Store quản lý trạng thái phòng ăn, bộ bài (roomDeck), lịch sử quẹt và kết quả bình chọn
import { create } from 'zustand';
import {
  RoomStatus,
  type PlaceResponse,
  type RoomResponse,
  type RoomSwipeResultItem,
  type UserResponse,
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
  addRoomMember: (member: UserResponse, currentCount?: number) => void;
  removeRoomMember: (userId: string, currentCount?: number, newHostId?: string) => void;
  setRoomMatchedPlace: (place: PlaceResponse) => void;
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

  addRoomMember: (member, currentCount) =>
    set((state) => {
      if (!state.currentRoom) return state;
      const existingMembers = state.currentRoom.members || [];
      const alreadyExists = existingMembers.some((m) => m.id === member.id);
      const nextMembers = alreadyExists
        ? existingMembers.map((m) => (m.id === member.id ? member : m))
        : [...existingMembers, member];

      const updatedRoom: RoomResponse = {
        ...state.currentRoom,
        members: nextMembers,
        currentMembers: currentCount ?? nextMembers.length,
      };

      return {
        currentRoom: updatedRoom,
      };
    }),

  removeRoomMember: (userId, currentCount, newHostId) =>
    set((state) => {
      if (!state.currentRoom) return state;
      const existingMembers = state.currentRoom.members || [];
      const nextMembers = existingMembers.filter((m) => m.id !== userId);

      let nextHost = state.currentRoom.host;
      if (newHostId && state.currentRoom.host.id === userId) {
        const foundNewHost = nextMembers.find((m) => m.id === newHostId);
        if (foundNewHost) {
          nextHost = foundNewHost;
        }
      }

      const updatedRoom: RoomResponse = {
        ...state.currentRoom,
        host: nextHost,
        members: nextMembers,
        currentMembers: currentCount ?? nextMembers.length,
      };

      return {
        currentRoom: updatedRoom,
      };
    }),

  setRoomMatchedPlace: (place) =>
    set((state) => {
      if (!state.currentRoom) return state;
      const updatedRoom: RoomResponse = {
        ...state.currentRoom,
        status: RoomStatus.CLOSED,
        matchedPlace: place,
      };
      return {
        currentRoom: updatedRoom,
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
