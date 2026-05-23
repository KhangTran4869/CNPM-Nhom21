// =========================================================================
// MODEL ĐỊNH NGHĨA BẢNG SUBJECTS (Sequelize Model)
// Ý nghĩa: Khai báo cấu trúc bảng 'subjects' (Môn học) trong cơ sở dữ liệu.
// =========================================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: {
            min: 1
        }
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'CNTT'
    }
}, {
    tableName: 'subjects'
});

module.exports = Subject;
