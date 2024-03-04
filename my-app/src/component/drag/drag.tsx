import React,{useRef ,useEffect, useState} from "react";
import './drag.less'; // 导入样式文件
import Sortable from 'sortablejs'
const Drag = () => {

  const [items, setItems] = useState([
    { id: 1, text: "Item 1" },
    { id: 2, text: "Item 2" },
    { id: 3, text: "Item 3" },
    { id: 4, text: "Item 4" },
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    const sortable = Sortable.create(listRef.current, {
      animation: 150,
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        const newList = [...items];
        newList.splice(newIndex, 0, newList.splice(oldIndex, 1)[0]);
        setItems(newList); // 更新列表项的顺序

        //调用后端接口
      },
    });
    return () => {
      if (sortable) {
        sortable.destroy();
      }
    };
  }, [items]);
  return (
    <div ref={listRef} className="dragList">
      {items.map(item => (
        <div key={item.id} className="dragItem">
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default Drag;
