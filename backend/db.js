const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tdk",
    port: 3307
});

connection.connect((err) => {
    if (err) {
        console.log("Kết nối thất bại:", err);
        return;
    }

    console.log("Kết nối MySQL thành công!");
});

module.exports = connection;