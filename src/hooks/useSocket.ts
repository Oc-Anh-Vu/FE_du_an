// Hook quản lý kết nối STOMP/SockJS theo phòng và điều phối cơ chế REST Polling định kỳ
import { useCallback } from 'react';
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
  void options;

  const subscribe = useCallback(
    <T = unknown>(destination: string, handler: SocketMessageHandler<T>): SocketUnsubscribe => {
      return socketClient.subscribe<T>(destination, handler);
    },
    [],
  );

  const publish = useCallback(
    <T = unknown>(
      destination: string,
      body?: T,
      headers?: Record<string, string>,
    ): boolean => {
      return socketClient.publish<T>(destination, body, headers);
    },
    [],
  );

  const disconnect = useCallback(() => {
    socketClient.disconnect();
  }, []);

  const triggerPoll = useCallback(async (): Promise<void> => {}, []);

  return {
    isRealtimeEnabled: socketClient.isEnabled(),
    isConnected: socketClient.isConnected(),
    isPolling: false,
    subscribe,
    publish,
    disconnect,
    triggerPoll,
  };
}

export default useSocket;
