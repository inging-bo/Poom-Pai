// hooks/useTimeout.ts
import { useRef, useEffect, useCallback } from 'react';

// T는 콜백함수가 받을 인자의 타입입니다.
export const useTimeout = <T = void>(callback: (arg: T) => void, delay: number) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback((arg: T) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      callback(arg);
      timerRef.current = null;
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return trigger;
};