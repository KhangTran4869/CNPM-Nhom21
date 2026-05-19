import express from "express";
import { connectDB } from "./config/db.js";
import lecturersRouters from "./routes/lecturersRouters.js";
import departmentsRouter from "./routes/departmentsRouter.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use("/api/lecturers", lecturersRouters);
app.use("/api/departments", departmentsRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server đang chạy ở cổng ${PORT}`);
  });
});
