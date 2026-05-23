// =========================================================================
// MODEL ĐỊNH NGHĨA BẢNG ASSIGNMENTS (Sequelize Model)
// Ý nghĩa: Khai báo cấu trúc bảng 'assignments' (Đề xuất phân công) trong DB.
// =========================================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    classCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'class_code'
    },
    lecturerId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'lecturer_id'
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    proposerId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'proposer_id'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    }
}, {
    tableName: 'assignments'
});

module.exports = Assignment;
