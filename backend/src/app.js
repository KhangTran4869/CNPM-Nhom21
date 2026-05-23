// =========================================================================
// FILE KHỞI TẠO EXPRESS APP (Application Root)
// Ý nghĩa: Nơi cấu hình toàn bộ các cài đặt chung cho Express Server:
// CORS (chia sẻ tài nguyên chéo cổng), Body Parser, Mount các Routes chính.
// =========================================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Khởi tạo Express
const app = express();

// --- 🌐 MIDDLEWARES TOÀN CỤC ---
app.use(cors()); // Cho phép Frontend (thường chạy cổng 5173/80) gọi API sang Backend (cổng 3000)
app.use(express.json()); // Phân tích cú pháp dữ liệu JSON từ Client gửi lên (req.body)
app.use(express.urlencoded({ extended: true }));

// Thử nghiệm kết nối CSDL khi khởi động qua Sequelize
const sequelize = require('./config/database');

// Nạp tất cả các Model để Sequelize nhận dạng và đồng bộ tạo bảng tự động trong MySQL
const User = require('./models/userModel');
const Subject = require('./models/subjectModel');
const Class = require('./models/classModel');
const LecturerAvailability = require('./models/lecturerAvailabilityModel');
const Assignment = require('./models/assignmentModel');

sequelize.sync({ force: false }) // Đồng bộ cấu hình Model với DB thực tế (force: false để không làm mất data có sẵn)
    .then(() => {
        console.log('✨ Cơ sở dữ liệu đã được đồng bộ hóa thành công qua Sequelize!');
    })
    .catch((err) => {
        console.error('⚠️ Lỗi đồng bộ hóa Cơ sở dữ liệu:', err.message);
    });

// --- 🛣️ MOUNT CÁC ROUTE NGHIỆP VỤ ---
const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/assignments', assignmentRoutes); // Gắn tất cả route phân công bắt đầu bằng /api/assignments

// --- 🏠 TRANG CHỦ / KIỂM TRA ĐƯỜNG TRUYỀN ---
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Chào mừng bạn đến với API Hệ thống Phân công giảng viên!'
    });
});

// --- 🚨 MIDDLEWARE XỬ LÝ LỖI TOÀN CỤC (Global Error Handler) ---
// Giúp bắt các lỗi phát sinh trong hệ thống để tránh làm sập server và báo lại thân thiện cho Client.
app.use((err, req, res, next) => {
    console.error('[Error System Log]:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Lỗi hệ thống nghiêm trọng, vui lòng liên hệ Kỹ thuật viên!'
    });
});

module.exports = app;
