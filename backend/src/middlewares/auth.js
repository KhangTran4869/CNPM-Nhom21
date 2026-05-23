// =========================================================================
// MIDDLEWARE XÁC THỰC JWT & PHÂN QUYỀN (Auth Middleware)
// Ý nghĩa: Đóng vai trò là "người gác cổng" (Interceptor) cho các Endpoint API.
// Chỉ cho phép những request hợp lệ (có token) và đúng vai trò (Role) đi qua.
// =========================================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. MIDDLEWARE XÁC THỰC NGƯỜI DÙNG CHUNG (Yêu cầu đăng nhập)
const authenticate = (req, res, next) => {
    // Lấy token từ header Authorization (Thường có dạng: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Từ chối truy cập! Bạn chưa cung cấp mã xác thực JWT.' 
        });
    }

    try {
        // Kiểm tra và giải mã (verify) token bằng mã bí mật JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_12345');
        
        // Gán thông tin người dùng đã giải mã vào đối tượng req để các hàm phía sau sử dụng
        req.user = decoded; 
        
        next(); // Cho phép request đi tiếp tới Controller tiếp theo
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Mã xác thực JWT không hợp lệ hoặc đã hết hạn!' 
        });
    }
};

// 2. MIDDLEWARE KIỂM TRA QUYỀN TRUY CẬP (Role Authorization)
// Cho phép truyền vào danh sách các quyền được duyệt (ví dụ: 'ADMIN', 'HEAD', 'LECTURER')
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        // Đảm bảo request đã đi qua middleware authenticate trước đó và gán dữ liệu req.user
        if (!req.user || !req.user.role) {
            return res.status(403).json({ 
                success: false, 
                message: 'Không tìm thấy vai trò người dùng để xác thực quyền!' 
            });
        }

        // Kiểm tra xem vai trò của người dùng hiện tại có nằm trong danh sách được phép không
        const hasPermission = allowedRoles.includes(req.user.role.toUpperCase());
        
        if (!hasPermission) {
            return res.status(403).json({ 
                success: false, 
                message: `Quyền truy cập bị từ chối! Yêu cầu vai trò: [${allowedRoles.join(', ')}]` 
            });
        }

        next(); // Hợp lệ, cho phép truy cập
    };
};

module.exports = {
    authenticate,
    authorize
};
