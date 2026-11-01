// Hook trì hoãn giá trị và chống spam callback (~300ms) cho tìm kiếm địa điểm & quẹt thẻ
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const DEFAULT_DEBOUNCE_MS = 300;

export interface DebouncedCallbackControls<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => void;
}

// Trì hoãn cập nhật giá trị `value` sau khoảng thời gian `delayMs` (mặc định 300ms).

export function useDebounce<T>(value: T, delayMs: number = DEFAULT_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const normalizedDelay = Number.isFinite(delayMs) && delayMs >= 0 ? delayMs : DEFAULT_DEBOUNCE_MS;
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, normalizedDelay);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

// Trả về hàm callback đã được chống spam (debounce ~300ms) kèm phương thức `.cancel()` và `.flush()`.
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void | Promise<void>,
  delayMs: number = DEFAULT_DEBOUNCE_MS,
): DebouncedCallbackControls<TArgs> {
  const callbackRef = useRef(callback);
  const timerRef = useRef<number | null>(null);
  const pendingArgsRef = useRef<TArgs | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingArgsRef.current !== null) {
      const args = pendingArgsRef.current;
      pendingArgsRef.current = null;
      void callbackRef.current(...args);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      pendingArgsRef.current = null;
    };
  }, []);

  const debouncedCallback = useMemo(() => {
    const normalizedDelay = Number.isFinite(delayMs) && delayMs >= 0 ? delayMs : DEFAULT_DEBOUNCE_MS;

    const invoke = ((...args: TArgs) => {
      pendingArgsRef.current = args;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        const latestArgs = pendingArgsRef.current;
        pendingArgsRef.current = null;
        if (latestArgs !== null) {
          void callbackRef.current(...latestArgs);
        }
      }, normalizedDelay);
    }) as DebouncedCallbackControls<TArgs>;

    invoke.cancel = cancel;
    invoke.flush = flush;
    return invoke;
  }, [delayMs, cancel, flush]);

  return debouncedCallback;
}

export default useDebounce;
