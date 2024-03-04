import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Drag from './component/drag/drag.tsx'; // 确保路径和配置正确
import Selectapp from './component/select/select.tsx';
import ScrollFetch from './component/ScrollFetch/ScrollFetch.tsx';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/drag" element={<Drag />} />
        {/* 在v6中，你使用element属性和JSX来指定组件 */}
        <Route path="/select" element={<Selectapp />} />
        <Route path="/Scroll" element={<ScrollFetch />} />
      </Routes>
    </Router>
  );
};

export default App;
