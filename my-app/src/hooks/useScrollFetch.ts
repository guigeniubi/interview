import lodash from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export interface Option<Data> {
  threshold?: number;
  afterFetching?: (data: Data) => void;
  isEnd?: (allData?: Data) => boolean;
  watch?: any;
}

// type TData = Record<string, any>[];

/**
 * 滚动加载
 * @param service 请求函数
 * @param container 滚动元素容器，不传默认使用body
 * @param options
 * @returns
 */
/**
 *
 * @description 获取的数据是累积添加的
 */
export function useScrollFetch<T extends any[] | undefined>(
  service: (isReset: boolean) => Promise<T>,
  container?: HTMLDivElement | undefined,
  options?: Option<T>,
): [T | undefined, boolean] {
  const { threshold, afterFetching, isEnd, watch } = {
    threshold: 0,
    ...options,
  };
  if (typeof isEnd !== "function") {
    throw Error("options.isEnd must be a function");
  }
  const [isLoading, toggleLoading] = useState<boolean>(false);
  const [data, setData] = useState<T>([] as unknown as T);
  const watchedValue = useRef<any>(watch);
  const isFetching = useRef<boolean>(false);
  const initialized = useRef<boolean>(false);
  const wrappedService = useCallback(
    (reset?: boolean) => {
      isFetching.current = true;
      toggleLoading(true);
      const promise = service(!!reset);

      if (!(promise instanceof Promise)) {
        console.warn("service must be an async function");
        return Promise.resolve(promise);
      }
      return promise
        .then((response) => {
          if (typeof afterFetching === "function") {
            afterFetching(response);
          }
          isFetching.current = false;
          if (reset) {
            setData(response);
          } else if (response) {
            setData(data?.concat(response) as T);
          }
          toggleLoading(false);
        })
        .catch(() => {
          toggleLoading(false);
        });
    },
    [afterFetching, data, service],
  );

  // 第一次加载
  useEffect(() => {
    if (!initialized.current) {
      wrappedService();
      initialized.current = true;
    }
  }, [wrappedService]);

  // 监听watch变化，初始时不应该触发加载，有变化后，需要重置数据
  useEffect(() => {
    if (typeof watch === "undefined" || watch === null) {
      return;
    }

    const shouldReload = Array.isArray(watchedValue.current)
      ? watchedValue.current.some((item, index) => !lodash?.isEqual(item, watch[index]))
      : watchedValue.current !== watch;

    if (shouldReload) {
      wrappedService(true);
      watchedValue.current = watch;
    }
  }, [watch, wrappedService]);

  const handleOnScroll = useCallback(() => {
    const shouldFetch =
      (!container
        ? document.documentElement.scrollHeight - window.scrollY - document.body.offsetHeight <= threshold
        : container.scrollHeight - container.scrollTop - container.offsetHeight <= threshold) && !isEnd(data);

    if (shouldFetch && !isFetching.current) {
      wrappedService();
    }
  }, [container, data, isEnd, threshold, wrappedService]);

  // 添加事件监听
  useEffect(() => {
    (container || document).addEventListener("scroll", handleOnScroll);
    return () => {
      (container || document).removeEventListener("scroll", handleOnScroll);
    };
  }, [container, handleOnScroll]);

  useEffect(() => {
    if (container) {
      // NOTE: 需要给container设置overflow:scroll才监听的到scroll
      container!.style!.overflow = "scroll";
    }
  }, [container]);

  return [data, isLoading];
}
