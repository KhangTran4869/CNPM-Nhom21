// =========================================================================
// MODEL ĐỊNH NGHĨA BẢNG CLASSES (Sequelize Model)
// Ý nghĩa: Khai báo cấu trúc bảng 'classes' (Lớp tín chỉ) trong cơ sở dữ liệu.
// =========================================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    classCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'class_code',
        validate: {
            notEmpty: true
        }
    },
    subjectCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subject_code'
    },
    subjectName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subject_name'
    },
    semester: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Học kỳ 2025-1'
    },
    dayOfWeek: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'day_of_week'
    },
    shift: {
        type: DataTypes.STRING, // 'sang', 'chieu', 'toi'
        allowNull: false
    },
    room: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Phòng A101'
    },
    totalStudents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        field: 'total_students'
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'PENDING', 'ASSIGNED'),
        allowNull: false,
        defaultValue: 'OPEN'
    },
    lecturerId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lecturer_id'
    },
    lecturerName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lecturer_name'
    }
}, {
    tableName: 'classes'
});

module.exports = Class;
