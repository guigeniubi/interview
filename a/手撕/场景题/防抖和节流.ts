import { useEffect, useRef, useState } from "react";
//节流:
function throttle(fn, timeout) {
  let timer = null; //闭包
  return function () {
    let args = arguments;
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, timeout);
    }
  };
}

function throttle(fn, timeout, immediate = false) {
  let timer = null;
  let immediate = true; // 添加一个标志位用于立即执行
  return function () {
    let args = arguments;
    if (immediate) {
      fn.apply(this, args);
      immediate = false;
    }
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
        immediate = true; // 重置标志位
      }, timeout);
    }
  };
}

//防抖
function debounce(fn, timeout) {
  let timer = null; //闭包
  return function () {
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, timeout);
  };
}
function debounce(fn, timeout) {
  let timer = null; //闭包
  return function () {
    let args = arguments;
    const immediate = !timer; // 判断是否是第一次调用
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, timeout);
    if (immediate) {
      fn.apply(this, args);
    }
  };
}
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
