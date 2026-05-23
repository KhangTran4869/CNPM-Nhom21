// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: '127.0.0.1',
//   port: 3308,         // Cổng bạn đã map cho mysql-tdk
//   user: 'root',
//   password: '123456',
//   database: 'tdk', // Tên schema bạn vừa tạo ở trên
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Kiểm tra thử kết nối
// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('Lỗi kết nối Docker (3308):', err.message);
//   } else {
//     console.log('Kết nối thành công tới container mysql-tdk!');
//     connection.release();
//   }
// });



const mysql = require('mysql2');
require('dotenv').config(); // Nạp cấu hình từ file .env vào process.env

// Tạo Pool kết nối
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Chuyển pool sang dạng hỗ trợ Promise (để dùng async/await)
const promisePool = pool.promise();

// Kiểm tra kết nối thử khi khởi động ứng dụng
promisePool.getConnection()
    .then(connection => {
        console.log(`Kết nối thành công tới Database: ${process.env.DB_NAME} (Port: ${process.env.DB_PORT})`);
        connection.release(); // Giải phóng kết nối lại vào pool
    })
    .catch(err => {
        console.error('Lỗi kết nối database rồi:', err.message);
    });

module.exports = promisePool;