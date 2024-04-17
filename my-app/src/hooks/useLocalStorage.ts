import { useCallback, useEffect, useRef, useState } from "react";

export interface Option<Data> {}
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
export function useLocalStorage<T extends any[] | undefined>(
  key: any,
  initialize: any
) {
  const [storeValue, setStoreValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialize;
    } catch (error) {
      return initialize;
    }
  });

  const setValue = value=>{
    try{
        const valueToStore = value instanceof Function ? value(storeValue) : value;
        setStoreValue(valueToStore)
        window.localStorage.setItem(key,JSON.stringify(valueToStore))

    }catch(error){

    }
  }
  return [storeValue,setValue];
}
