import React, { useState } from 'react';
import { Select, Radio } from 'antd';

const { Option } = Select;

const Selectapp = () => {
  const [selectedOrderBy, setSelectedOrderBy] = useState('user_updated_at');
  const [selectedOrder, setSelectedOrder] = useState('desc');

  const handleOrderByChange = e => {
    setSelectedOrderBy(e.target.value);
  };

  const handleOrderChange = e => {
    setSelectedOrder(e.target.value);
  };

  return (
    <Select
      labelInValue
      defaultValue={{ value: selectedOrderBy }}
      style={{ width: 120 }}
      onDropdownVisibleChange={(open) => !open && console.log(selectedOrderBy, selectedOrder)}
      dropdownRender={menu => (
        <div>
          <div style={{ padding: 8 }}>
            <Radio.Group
              onChange={handleOrderByChange}
              value={selectedOrderBy}
            >
              <Radio value="user_updated_at">修改时间</Radio>
              <Radio value="created_at">创建时间</Radio>
              <Radio value="name">名称</Radio>
            </Radio.Group>
          </div>
          <div style={{ padding: 8 }}>
            <Radio.Group
              onChange={handleOrderChange}
              value={selectedOrder}
            >
              <Radio value="desc">降序</Radio>
              <Radio value="asc">升序</Radio>
            </Radio.Group>
          </div>
        </div>
      )}
    >
      <Option value="user_updated_at">修改时间</Option>
      <Option value="created_at">创建时间</Option>
      <Option value="name">名称</Option>
    </Select>
  );
};

export default Selectapp;
