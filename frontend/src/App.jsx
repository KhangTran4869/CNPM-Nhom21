// =========================================================================
// HỢP PHẦN KHỞI CHẠY LỚP TRÊN CÙNG (App Component Root)
// Ý nghĩa: Là điểm bắt đầu của ứng dụng React, bao bọc toàn bộ hệ thống
// bằng BrowserRouter để kích hoạt chức năng định tuyến (Routing).
// =========================================================================

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
