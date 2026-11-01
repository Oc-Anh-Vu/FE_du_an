// Singleton quản lý kết nối STOMP/SockJS ([PENDING_BACKEND] - Kiểm soát qua VITE_ENABLE_WS === 'true')
import { Client, type IFrame, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL, getAccessToken } from './apiClient';

export type SocketMessageHandler<T = unknown> = (payload: T, rawMessage: IMessage) => void;
export type SocketUnsubscribe = () => void;

export interface SocketConnectOptions {
  token?: string | null;
  url?: string;
  useSockJS?: boolean;
  reconnectDelayMs?: number;
  onConnect?: (frame: IFrame) => void;
  onDisconnect?: () => void;
  onError?: (message: string) => void;
}

interface ManagedSubscription {
  id: string;
  destination: string;
  handler: SocketMessageHandler<unknown>;
  stompSub: StompSubscription | null;
}

const DEFAULT_RECONNECT_DELAY_MS = 5000;

function resolveDefaultWsUrl(): string {
  const configuredUrl = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  return `${normalizedBase}/ws`;
}

function toHttpSockJsUrl(url: string): string {
  if (url.startsWith('wss://')) {
    return `https://${url.slice('wss://'.length)}`;
  }
  if (url.startsWith('ws://')) {
    return `http://${url.slice('ws://'.length)}`;
  }
  return url;
}

function toWebSocketBrokerUrl(url: string): string {
  if (url.startsWith('https://')) {
    return `wss://${url.slice('https://'.length)}`;
  }
  if (url.startsWith('http://')) {
    return `ws://${url.slice('http://'.length)}`;
  }
  return url;
}

function parseStompMessageBody<T>(rawBody: string): T {
  const trimmed = rawBody.trim();
  if (!trimmed) {
    return undefined as T;
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return rawBody as unknown as T;
  }
}

class SocketClient {
  private client: Client | null = null;
  private connected = false;
  private subSequence = 0;
  private readonly subscriptions = new Map<string, ManagedSubscription>();

  // Kiểm tra cờ bật/tắt WebSocket qua biến môi trường VITE_ENABLE_WS === 'true'
  public isEnabled(): boolean {
    const flag = (import.meta.env.VITE_ENABLE_WS as string | boolean | undefined) ?? '';
    return String(flag).trim().toLowerCase() === 'true';
  }

  // Trả về trạng thái kết nối thực tế của STOMP Client
  public isConnected(): boolean {
    if (!this.isEnabled() || !this.client) {
      return false;
    }
    return this.connected && Boolean(this.client.connected);
  }

  // Khởi tạo kết nối STOMP/SockJS (No-Op an toàn tuyệt đối khi VITE_ENABLE_WS !== 'true')
  public connect(options: SocketConnectOptions = {}): void {
    if (!this.isEnabled() || typeof window === 'undefined') {
      return;
    }

    if (this.client?.active) {
      return;
    }

    const token = options.token !== undefined ? options.token : getAccessToken();
    const targetUrl = (options.url ?? resolveDefaultWsUrl()).trim();
    const useSockJS = options.useSockJS ?? true;
    const connectHeaders: Record<string, string> = {};

    if (token) {
      connectHeaders.Authorization = `Bearer ${token}`;
    }

    const client = new Client({
      connectHeaders,
      reconnectDelay: options.reconnectDelayMs ?? DEFAULT_RECONNECT_DELAY_MS,
      debug: () => {
        // Không in log debug ra Console để tránh nhiễu
      },
      ...(useSockJS
        ? {
            webSocketFactory: () => new SockJS(toHttpSockJsUrl(targetUrl)),
          }
        : {
            brokerURL: toWebSocketBrokerUrl(targetUrl),
          }),
      onConnect: (frame: IFrame) => {
        this.connected = true;
        this.attachPendingSubscriptions();
        options.onConnect?.(frame);
      },
      onDisconnect: () => {
        this.connected = false;
        this.clearActiveStompHandles();
        options.onDisconnect?.();
      },
      onWebSocketClose: () => {
        this.connected = false;
        this.clearActiveStompHandles();
      },
      onStompError: (frame: IFrame) => {
        const errorMessage = frame.headers?.message || frame.body || 'Lỗi giao thức STOMP.';
        options.onError?.(errorMessage);
      },
      onWebSocketError: () => {
        options.onError?.('Không thể thiết lập kết nối WebSocket tới máy chủ.');
      },
    });

    this.client = client;

    try {
      client.activate();
    } catch {
      this.connected = false;
    }
  }

  // Ngắt kết nối và hủy toàn bộ STOMP subscriptions đang mở (No-Op an toàn khi chưa kết nối)
  public disconnect(): void {
    this.connected = false;

    for (const entry of this.subscriptions.values()) {
      if (entry.stompSub) {
        try {
          entry.stompSub.unsubscribe();
        } catch {
          // Bỏ qua lỗi khi đóng kết nối
        }
        entry.stompSub = null;
      }
    }
    this.subscriptions.clear();

    if (!this.client) {
      return;
    }

    const activeClient = this.client;
    this.client = null;

    try {
      void activeClient.deactivate();
    } catch {
      // Bỏ qua lỗi khi ngắt kết nối
    }
  }

  // Đăng ký lắng nghe một destination STOMP và trả về hàm unsubscribe an toàn
  public subscribe<T = unknown>(
    destination: string,
    callback: SocketMessageHandler<T>,
  ): SocketUnsubscribe {
    const cleanDestination = destination.trim();
    if (!this.isEnabled() || !cleanDestination) {
      return () => {
        // No-Op unsubscribe khi WebSocket đang ở trạng thái [PENDING_BACKEND]
      };
    }

    this.subSequence += 1;
    const id = `sub-${this.subSequence}`;
    const entry: ManagedSubscription = {
      id,
      destination: cleanDestination,
      handler: callback as SocketMessageHandler<unknown>,
      stompSub: null,
    };

    this.subscriptions.set(id, entry);

    if (this.isConnected() && this.client) {
      entry.stompSub = this.bindStompSubscription(this.client, entry);
    }

    return () => {
      const current = this.subscriptions.get(id);
      if (!current) {
        return;
      }
      this.subscriptions.delete(id);
      if (current.stompSub) {
        try {
          current.stompSub.unsubscribe();
        } catch {
          // Bỏ qua lỗi nếu kết nối đã đóng trước đó
        }
        current.stompSub = null;
      }
    };
  }

  // Gửi bản tin lên destination STOMP (No-Op an toàn khi chưa bật hoặc chưa kết nối)
  public publish<T = unknown>(
    destination: string,
    body?: T,
    headers?: Record<string, string>,
  ): boolean {
    const cleanDestination = destination.trim();
    if (!this.isEnabled() || !this.isConnected() || !this.client || !cleanDestination) {
      return false;
    }

    const serializedBody =
      body === undefined
        ? ''
        : typeof body === 'string'
          ? body
          : JSON.stringify(body);

    try {
      this.client.publish({
        destination: cleanDestination,
        body: serializedBody,
        headers,
      });
      return true;
    } catch {
      return false;
    }
  }

  private attachPendingSubscriptions(): void {
    if (!this.client || !this.client.connected) {
      return;
    }
    for (const entry of this.subscriptions.values()) {
      if (!entry.stompSub) {
        entry.stompSub = this.bindStompSubscription(this.client, entry);
      }
    }
  }

  private clearActiveStompHandles(): void {
    for (const entry of this.subscriptions.values()) {
      entry.stompSub = null;
    }
  }

  private bindStompSubscription(
    client: Client,
    entry: ManagedSubscription,
  ): StompSubscription | null {
    try {
      return client.subscribe(entry.destination, (message: IMessage) => {
        const parsed = parseStompMessageBody<unknown>(message.body);
        entry.handler(parsed, message);
      });
    } catch {
      return null;
    }
  }
}

export const socketClient = new SocketClient();
export default socketClient;
