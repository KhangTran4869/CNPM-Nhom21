const express = require("express");
const db = require("./db");

const app = express();

app.get("/lecturers", (req, res) => {

    db.query("SELECT * FROM lecturers", (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
});

app.listen(3000, () => {
    console.log("Server chạy cổng 3000");
});