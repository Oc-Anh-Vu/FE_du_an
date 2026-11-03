import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../../store/roomStore';
import { useBillingStore } from '../../store/billingStore';
import { useUIStore } from '../../store/uiStore';

// Chỉ kết thúc phiên phòng hiện tại, không ngắt socket singleton của các nơi khác.
export function useRoomSession(roomId?: string) {
  const navigate = useNavigate();
  const sessionRef = useRef<{ roomId: string; controller: AbortController } | null>(null);
  const [endedRoomId, setEndedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const session = { roomId, controller: new AbortController() };
    sessionRef.current = session;
    return () => session.controller.abort();
  }, [roomId]);

  const getSessionSignal = useCallback(() => {
    const session = sessionRef.current;
    return session && session.roomId === roomId ? session.controller.signal : undefined;
  }, [roomId]);

  const isSessionActive = useCallback(() => {
    const signal = getSessionSignal();
    return Boolean(signal && !signal.aborted);
  }, [getSessionSignal]);

  const endRoomSession = useCallback((message?: string) => {
    if (!isSessionActive()) return;
    sessionRef.current?.controller.abort();
    setEndedRoomId(roomId ?? null);
    const state = useRoomStore.getState();
    const ownsSession = !state.currentRoom || state.currentRoom.id === roomId;
    useRoomStore.setState({
      activeRooms: state.activeRooms.filter((room) => room.id !== roomId),
      ...(ownsSession ? { currentRoom: null, roomDeck: [], mySwipes: [], swipeResults: [] } : {}),
    });
    if (ownsSession) useBillingStore.getState().setRoomExpenses([]);
    useUIStore.getState().showToast(
      'warning', message || 'Phòng ăn không tồn tại hoặc bạn không còn là thành viên.',
    );
    navigate('/app/room', { replace: true });
  }, [roomId, isSessionActive, navigate]);

  return {
    isRoomSessionEnabled: Boolean(roomId && endedRoomId !== roomId),
    getSessionSignal,
    isSessionActive,
    endRoomSession,
  };
}
