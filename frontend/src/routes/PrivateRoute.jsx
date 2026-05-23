// =========================================================================
// HỢP PHẦN BẢO VỆ ĐƯỜNG DẪN (Private Route Guard)
// Ý nghĩa: Chặn người dùng chưa đăng nhập hoặc truy cập sai quyền hạn (Role).
// Rất quan trọng khi báo cáo vì đây là xương sống của bảo mật Frontend!
// =========================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
    // Lấy thông tin token và thông tin user đã đăng nhập
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    // Nếu chưa đăng nhập (không có token), chuyển hướng ngay về trang đăng nhập
    if (!token || !savedUser) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(savedUser);
        
        // Nếu có quy định vai trò cụ thể, kiểm tra xem vai trò của user có nằm trong danh sách không
        if (allowedRoles.length > 0) {
            const hasAccess = allowedRoles.includes(user.role.toUpperCase());
            
            if (!hasAccess) {
                // Nếu sai vai trò, chuyển hướng về trang không có quyền (hoặc về đúng trang chính của họ)
                console.warn(`User role [${user.role}] không được phép truy cập đường dẫn này.`);
                
                // Trả về trang Dashboard mặc định phù hợp với quyền của họ để tránh kẹt trang
                if (user.role.toUpperCase() === 'ADMIN') return <Navigate to="/admin" replace />;
                if (user.role.toUpperCase() === 'HEAD') return <Navigate to="/head" replace />;
                if (user.role.toUpperCase() === 'LECTURER') return <Navigate to="/lecturer" replace />;
                
                return <Navigate to="/login" replace />;
            }
        }
    } catch (e) {
        // Phòng hờ lỗi dữ liệu localStorage bị lỗi, xóa sạch và yêu cầu đăng nhập lại
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }

    // Nếu thỏa mãn mọi điều kiện, cho phép xem trang web (render components con)
    return children;
};

export default PrivateRoute;
