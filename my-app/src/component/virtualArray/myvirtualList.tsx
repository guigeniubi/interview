import React, { useRef, useState, useEffect } from 'react';

// 模拟数据
const data = Array.from({ length: 10000 }, (_, index) => `Item ${index}`);

// 虚拟列表组件
const VirtualList: React.FC<{ data: string[]; itemHeight: number; visibleItemCount: number }> = ({
  data,
  itemHeight,
  visibleItemCount,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(visibleItemCount - 1);
  const containerRef = useRef<HTMLDivElement>(null);

  // 监听滚动事件，更新可视区域的元素索引范围
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    const newEndIndex = Math.min(data.length - 1, newStartIndex + Math.ceil(clientHeight / itemHeight) - 1);
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // 获取可视区域的数据
  const visibleData = data.slice(startIndex, endIndex + 1);

  // 计算容器的总高度
  const containerHeight = data.length * itemHeight;

  return (
    <div
      ref={containerRef}
      style={{ height: '400px', overflowY: 'auto' }}
    >
      <div style={{ height: containerHeight }}>
        {visibleData.map((item, index) => (
          <div key={startIndex + index} style={{ height: itemHeight }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

// 使用示例
const MyVirtualList: React.FC = () => {
  return <VirtualList data={data} itemHeight={30} visibleItemCount={10} />;
};

export default MyVirtualList;
