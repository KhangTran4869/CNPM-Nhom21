// =========================================================================
// MODEL ĐỊNH NGHĨA BẢNG USERS (Sequelize Model)
// Ý nghĩa: Khai báo cấu trúc bảng 'users' trong CSDL và ánh xạ sang đối tượng JS.
// Rất thích hợp để báo cáo vì có tích hợp tự động mã hóa mật khẩu khi lưu!
// =========================================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Tự động sinh ID dạng UUID (Chuỗi ngẫu nhiên duy nhất bảo mật)
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'Tên đăng nhập này đã tồn tại!' // Báo lỗi cụ thể khi bị trùng tên đăng nhập
        },
        validate: {
            notEmpty: true,
            len: [4, 50] // Tên đăng nhập tối thiểu 4 ký tự, tối đa 50 ký tự
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [6, 100] // Mật khẩu tối thiểu từ 6 ký tự
        }
    },
    roleId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'role_id' // Khóa ngoại kết nối với bảng Roles
    },
    status: {
        type: DataTypes.ENUM('active', 'locked'),
        defaultValue: 'active',
        allowNull: false
    }
}, {
    tableName: 'users', // Tên bảng thực tế trong cơ sở dữ liệu MySQL
    hooks: {
        // HOOK TỰ ĐỘNG CHẠY TRƯỚC KHI TẠO USER MỚI (Before Create)
        // Nghiệp vụ: Tự động mã hóa mật khẩu bằng bcryptjs trước khi lưu xuống DB
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10); // Tạo chuỗi muối (salt) độ phức tạp 10
                user.password = await bcrypt.hash(user.password, salt); // Hóa mã băm
            }
        },
        // HOOK TỰ ĐỘNG CHẠY KHI CẬP NHẬT USER (Before Update)
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Hàm hỗ trợ kiểm tra mật khẩu khi đăng nhập (Authentication)
// Giúp Trưởng khoa, Giảng viên hoặc Admin xác thực thông tin
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
