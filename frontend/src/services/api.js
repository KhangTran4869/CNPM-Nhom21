// =========================================================================
// AXIOS API CLIENT CONFIGURATION (Axios Instance)
// Ý nghĩa: Định cấu hình một HTTP Client dùng chung để gọi dữ liệu từ Backend.
// Có tính năng tự động đính kèm Token JWT vào Header của mọi request.
// =========================================================================

import axios from 'axios';

// Khởi tạo một đối tượng Axios với cấu hình mặc định
const apiClient = axios.create({
    // Đường dẫn API gốc (khi deploy thật có thể thay đổi bằng biến môi trường)
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000, // Thời gian tối đa chờ phản hồi là 10 giây
    headers: {
        'Content-Type': 'application/json',
    }
});

// INTERCEPTOR CHO REQUEST: Chạy TRƯỚC KHI request được gửi lên Server
apiClient.interceptors.request.use(
    (config) => {
        // Lấy token đăng nhập được lưu trữ trong localStorage của trình duyệt
        const token = localStorage.getItem('token');
        
        // Nếu có token, tự động gắn vào Header Authorization theo chuẩn Bearer Token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR CHO RESPONSE: Chạy SAU KHI nhận kết quả từ Server trả về
apiClient.interceptors.response.use(
    (response) => {
        return response.data; // Chỉ lấy phần dữ liệu chính, đỡ mất công gọi .data ở ngoài
    },
    (error) => {
        // Xử lý tự động lỗi xác thực (Token hết hạn, sai token -> Force Logout)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Phiên làm việc hết hạn hoặc không hợp lệ. Đang đăng xuất...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Nếu không ở trang login, tự động đưa về trang login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error.response ? error.response.data : error);
    }
);

export default apiClient;
