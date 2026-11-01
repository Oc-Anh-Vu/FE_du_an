// Hook quản lý kết nối STOMP/SockJS theo phòng và điều phối cơ chế REST Polling định kỳ
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  socketClient,
  type SocketMessageHandler,
  type SocketUnsubscribe,
} from '../services/socketClient';
import type { UUID } from '../types';

export const DEFAULT_LOBBY_POLL_INTERVAL_MS = 3000;
export const DEFAULT_SWIPE_POLL_INTERVAL_MS = 4000;

export interface UseSocketOptions<TPayload = unknown> {
  roomId?: UUID | null;
  destination?: string | null;
  enabled?: boolean;
  onMessage?: SocketMessageHandler<TPayload>;
  onPoll?: () => void | Promise<void>;
  pollIntervalMs?: number;
  pollImmediately?: boolean;
}

export interface UseSocketReturn {
  isRealtimeEnabled: boolean;
  isConnected: boolean;
  isPolling: boolean;
  subscribe: <T = unknown>(
    destination: string,
    handler: SocketMessageHandler<T>,
  ) => SocketUnsubscribe;
  publish: <T = unknown>(
    destination: string,
    body?: T,
    headers?: Record<string, string>,
  ) => boolean;
  disconnect: () => void;
  triggerPoll: () => Promise<void>;
}

export function useSocket<TPayload = unknown>(
  options: UseSocketOptions<TPayload> = {},
): UseSocketReturn {
  const {
    roomId,
    destination,
    enabled = true,
    onMessage,
    onPoll,
    pollIntervalMs = DEFAULT_LOBBY_POLL_INTERVAL_MS,
    pollImmediately = false,
  } = options;

  const isRealtimeEnabled = socketClient.isEnabled();
  const [isConnected, setIsConnected] = useState<boolean>(() => socketClient.isConnected());

  const onMessageRef = useRef<SocketMessageHandler<TPayload> | undefined>(onMessage);
  const onPollRef = useRef<(() => void | Promise<void>) | undefined>(onPoll);
  const isPollInFlightRef = useRef(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  const resolvedDestination =
    destination !== undefined && destination !== null
      ? destination.trim()
      : roomId
        ? `/topic/rooms/${roomId}`
        : '';

  const triggerPoll = useCallback(async (): Promise<void> => {
    const pollFn = onPollRef.current;
    if (!pollFn || isPollInFlightRef.current) {
      return;
    }
    isPollInFlightRef.current = true;
    try {
      await pollFn();
    } catch {
      // Lỗi mạng/API trong lượt polling định kỳ được xử lý tại hàm truyền vào
    } finally {
      isPollInFlightRef.current = false;
    }
  }, []);

  // Quản lý kết nối và đăng ký STOMP khi VITE_ENABLE_WS === 'true'
  useEffect(() => {
    if (!enabled || !isRealtimeEnabled) {
      return;
    }

    socketClient.connect({
      onConnect: () => {
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onError: () => {
        setIsConnected(false);
      },
    });

    if (!resolvedDestination) {
      return;
    }

    const unsubscribe = socketClient.subscribe<TPayload>(
      resolvedDestination,
      (payload, rawMessage) => {
        onMessageRef.current?.(payload, rawMessage);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, isRealtimeEnabled, resolvedDestination]);

  // Kích hoạt REST Polling định kỳ (3000ms - 4000ms) khi WebSocket chưa bật ([PENDING_BACKEND]) hoặc chưa kết nối
  const shouldUseRestPolling = Boolean(
    enabled && onPoll && (!isRealtimeEnabled || !isConnected),
  );

  useEffect(() => {
    if (!shouldUseRestPolling) {
      return;
    }

    const safeIntervalMs =
      Number.isFinite(pollIntervalMs) && pollIntervalMs >= 1000
        ? pollIntervalMs
        : DEFAULT_LOBBY_POLL_INTERVAL_MS;

    let initialTimerId: number | null = null;
    if (pollImmediately) {
      initialTimerId = window.setTimeout(() => {
        void triggerPoll();
      }, 0);
    }

    const intervalId = window.setInterval(() => {
      void triggerPoll();
    }, safeIntervalMs);

    return () => {
      if (initialTimerId !== null) {
        window.clearTimeout(initialTimerId);
      }
      window.clearInterval(intervalId);
    };
  }, [shouldUseRestPolling, pollIntervalMs, pollImmediately, triggerPoll]);

  const subscribe = useCallback(
    <T = unknown>(targetDestination: string, handler: SocketMessageHandler<T>): SocketUnsubscribe => {
      return socketClient.subscribe<T>(targetDestination, handler);
    },
    [],
  );

  const publish = useCallback(
    <T = unknown>(
      targetDestination: string,
      body?: T,
      headers?: Record<string, string>,
    ): boolean => {
      return socketClient.publish<T>(targetDestination, body, headers);
    },
    [],
  );

  const disconnect = useCallback(() => {
    socketClient.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isRealtimeEnabled,
    isConnected,
    isPolling: shouldUseRestPolling,
    subscribe,
    publish,
    disconnect,
    triggerPoll,
  };
}

export default useSocket;
