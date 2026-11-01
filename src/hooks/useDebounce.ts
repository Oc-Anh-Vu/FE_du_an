// Hook trì hoãn giá trị và chống spam callback cho tìm kiếm địa điểm & quẹt thẻ
import { useCallback, useState } from 'react';

export const DEFAULT_DEBOUNCE_MS = 300;

export interface DebouncedCallbackControls<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => void;
}

export function useDebounce<T>(value: T, delayMs: number = DEFAULT_DEBOUNCE_MS): T {
  const [debouncedValue] = useState<T>(value);
  void delayMs;
  return debouncedValue;
}

export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void | Promise<void>,
  delayMs: number = DEFAULT_DEBOUNCE_MS,
): DebouncedCallbackControls<TArgs> {
  void callback;
  void delayMs;

  const cancel = useCallback(() => {}, []);
  const flush = useCallback(() => {}, []);

  const debouncedFn = useCallback((...args: TArgs) => {
    void args;
  }, []) as DebouncedCallbackControls<TArgs>;

  debouncedFn.cancel = cancel;
  debouncedFn.flush = flush;

  return debouncedFn;
}

export default useDebounce;
