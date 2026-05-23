// =========================================================================
// FILE CẤU HÌNH KẾT NỐI DATABASE (Sequelize ORM)
// Ý nghĩa: Định nghĩa cách Backend kết nối tới cơ sở dữ liệu MySQL.
// Sử dụng các biến môi trường để dễ dàng đổi cổng/đổi mật khẩu khi Deploy.
// =========================================================================

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load các biến môi trường từ file .env

// Tạo một thực thể (instance) kết nối của Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME || 'cnpm_assignment', // Tên cơ sở dữ liệu
    process.env.DB_USER || 'cnpm_user',       // Tài khoản truy cập
    process.env.DB_PASS || 'cnpm_password_here', // Mật khẩu truy cập
    {
        host: process.env.DB_HOST || '127.0.0.1', // Host kết nối (IP localhost hoặc tên service "db" trong Docker)
        port: process.env.DB_PORT || 3308,        // Cổng kết nối (máy thật là 3308, trong Docker network là 3306)
        dialect: 'mysql',                         // Loại cơ sở dữ liệu sử dụng
        logging: false,                           // Tắt bớt log SQL thô trong console để tránh bị rối mắt khi chạy dev
        pool: {
            max: 5,                               // Số lượng kết nối tối đa mở cùng lúc
            min: 0,                               // Số lượng kết nối tối thiểu
            acquire: 30000,                       // Thời gian tối đa (ms) chờ lấy kết nối trước khi báo lỗi timeout
            idle: 10000                           // Thời gian tối đa (ms) một kết nối rảnh bị đóng lại giải phóng tài nguyên
        },
        define: {
            timestamps: true,                     // Tự động thêm cột createdAt và updatedAt vào mọi bảng
            underscored: true                     // Chuyển đổi tên cột camelCase thành snake_case (vd: userId -> user_id)
        }
    }
);

// Hàm kiểm tra thử kết nối cơ sở dữ liệu (rất hữu ích khi báo cáo đồ án)
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối thành công tới Database qua Sequelize ORM!');
    } catch (error) {
        console.error('❌ Lỗi kết nối database thông qua Sequelize:', error.message);
    }
};

// Gọi kiểm tra kết nối ngay khi khởi động
testConnection();

module.exports = sequelize;
