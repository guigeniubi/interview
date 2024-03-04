import React, { useRef } from "react";
import { useScrollFetch, Option } from "../../hooks/useScrollFetch.ts";

const fetchData = async (isReset: boolean) => {
  // 模拟异步获取数据
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // 模拟返回的数据
  const newData = Array.from({ length: 20 }, (_, index) => `Item ${index + 1}`);
  return newData;
};

const ScrollFetch = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const options: Option<any> = {
    threshold: 500,
    afterFetching: (res) => {
      console.log("Fetched data:", res);
    },
    isEnd: (allData) => allData && allData.length >= 50,
  };

  const [picList = [], isLoading] = useScrollFetch(fetchData, containerRef.current, options);

  return (
    <div ref={containerRef} style={{ height: "500px", overflow: "scroll" }}>
      {picList && picList.length > 0 ? (
        <ul>
          {picList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No data available</p>
      )}
      {isLoading && <p>Loading...</p>}
    </div>
  );
};

export default ScrollFetch;
