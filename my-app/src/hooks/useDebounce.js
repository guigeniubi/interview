// 防抖 Hook
export function useDebounce<T extends any[]>(fn: (...args: T) => void, delay: number): (...args: T) => void {
  const timerRef = useRef(null);
  return (...args: T) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// 节流 Hook
export function useThrottle<T extends any[]>(fn: (...args: T) => void, delay: number): (...args: T) => void {
  const lastExecTimeRef = useRef<number>(0);
  return (...args: T) => {
    const currentTime = Date.now();
    if (currentTime - lastExecTimeRef.current > delay) {
      fn(...args);
      lastExecTimeRef.current = currentTime;
    }
  };
}