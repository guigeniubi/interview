import { useRef, useEffect, useCallback } from "react";

function useDebounce(fn, delay, deps = []) {
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const debouncedFn = useCallback(
    (...args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay, ...deps]
  );

  return debouncedFn;
}
