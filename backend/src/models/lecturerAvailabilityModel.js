// =========================================================================
// MODEL ĐỊNH NGHĨA BẢNG LECTURER AVAILABILITIES (Sequelize Model)
// Ý nghĩa: Khai báo cấu trúc bảng 'lecturer_availabilities' (Báo bận giảng viên).
// =========================================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LecturerAvailability = sequelize.define('LecturerAvailability', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    lecturerId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'lecturer_id'
    },
    dayOfWeek: {
        type: DataTypes.STRING, // 't2', 't3', 't4', 't5', 't6', 't7', 'cn'
        allowNull: false,
        field: 'day_of_week'
    },
    shift: {
        type: DataTypes.STRING, // 'sang', 'chieu', 'toi'
        allowNull: false
    }
}, {
    tableName: 'lecturer_availabilities',
    indexes: [
        {
            unique: true,
            fields: ['lecturer_id', 'day_of_week', 'shift']
        }
    ]
});

module.exports = LecturerAvailability;
