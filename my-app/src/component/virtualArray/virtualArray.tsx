//ahooks version
// const [list, scrollTo] = useVirtualList<T>(
//     originalList: T[],
//     options: {
//       containerTarget: (() => Element) | Element | MutableRefObject<Element>,
//       wrapperTarget: (() => Element) | Element | MutableRefObject<Element>,
//       itemHeight: number | ((index: number, data: T) => number), //行高度，静态高度可以直接写入像素值，动态高度可传入函数
//       overscan?: number,
//     }
//   );
import React, { useMemo, useRef } from "react";
import { useVirtualList } from "ahooks";

const VirtualArray = () => {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  const originalList = useMemo(() => Array.from(Array(99).keys()), []);

  const [value, onChange] = React.useState<number>(0);

  const [list, scrollTo] = useVirtualList(originalList, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: (i) => (i % 2 === 0 ? 42 + 8 : 84 + 8),
    overscan: 10,
  });

  return (
    <div>
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <input
          style={{ width: 120 }}
          placeholder="line number"
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <button
          style={{ marginLeft: 8 }}
          type="button"
          onClick={() => {
            scrollTo(Number(value));
          }}
        >
          scroll to
        </button>
      </div>
      <div ref={containerRef} style={{ height: "300px", overflow: "auto" }}>
        <div ref={wrapperRef}>
          {list.map((ele) => (
            <div
              style={{
                height: ele.index % 2 === 0 ? 42 : 84,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #e8e8e8",
                marginBottom: 8,
              }}
              key={ele.index}
            >
              Row: {ele.data} size: {ele.index % 2 === 0 ? "small" : "large"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default VirtualArray;
