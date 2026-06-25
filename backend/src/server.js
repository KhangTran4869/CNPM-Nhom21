import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRouters from "./routes/authRouters.js";
import usersRouters from "./routes/usersRouters.js";
import lecturersRouters from "./routes/lecturersRouters.js";
import departmentsRouter from "./routes/departmentsRouters.js"
import semestersRouters from "./routes/semestersRouters.js";
import roomsRouters from "./routes/roomsRouters.js";
import schedulesRouters from "./routes/schedulesRouters.js";
import lecturerAvailabilityRouters from "./routes/lecturerAvailabilityRouters.js";
import rolesRouters from "./routes/rolesRouters.js";
import assignmentsRouters from "./routes/assignmentsRouters.js";
import assignmentHistoryRouters from "./routes/assignmentHistoryRouters.js";
import classesRouters from "./routes/classesRouters.js";
import coursesRouters from "./routes/CoursesRouters.js";
import reportsRouters from "./routes/reportsRouters.js";
import teachingRouters from "./routes/teachingRouters.js";
import { changePassword } from "./controllers/authController.js";
import { authenticate, authorize } from "./middlewares/auth.js";
import { errorResponse } from "./utils/apiResponse.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const mountApi = (prefix) => {
  app.use(`${prefix}/auth`, authRouters);
  app.post(`${prefix}/change-password`, authenticate, authorize("ADMIN", "HEAD", "LECTURER"), changePassword);
  app.put(`${prefix}/change-password`, authenticate, authorize("ADMIN", "HEAD", "LECTURER"), changePassword);
  app.patch(`${prefix}/change-password`, authenticate, authorize("ADMIN", "HEAD", "LECTURER"), changePassword);
  app.use(`${prefix}/lecturers`, lecturersRouters);
  app.use(`${prefix}/departments`, departmentsRouter);
  app.use(`${prefix}/users`, usersRouters);
  app.use(`${prefix}/semesters`, semestersRouters);
  app.use(`${prefix}/rooms`, roomsRouters);
  app.use(`${prefix}/schedules`, schedulesRouters);
  app.use(`${prefix}/availability`, lecturerAvailabilityRouters);
  app.use(`${prefix}/lecturer-availabilities`, lecturerAvailabilityRouters);
  app.use(`${prefix}/roles`, rolesRouters);
  app.use(`${prefix}/assignments`, assignmentsRouters);
  app.use(`${prefix}/assignment-history`, assignmentHistoryRouters);
  app.use(`${prefix}/classes`, classesRouters);
  app.use(`${prefix}/courses`, coursesRouters);
  app.use(`${prefix}/reports`, reportsRouters);
  app.use(prefix, teachingRouters);
};

mountApi("/api/v1");
mountApi("/api");

app.use((req, res) => errorResponse(res, "Không tìm thấy API", ["NOT_FOUND"], 404));
app.use((error, _req, res, _next) => {
  console.error(error);
  return errorResponse(
    res,
    error.message || "Lỗi server",
    error.errors || [error.message],
    error.statusCode || 500,
  );
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server đang chạy ở cổng ${PORT}`);
  });
});
