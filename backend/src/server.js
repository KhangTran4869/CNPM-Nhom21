import express from "express";
import { connectDB } from "./config/db.js";
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
import coursesRouters from "./routes/coursesRouters.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use("/api/lecturers", lecturersRouters);
app.use("/api/departments", departmentsRouter);
app.use("/api/users", usersRouters);
app.use("/api/semesters", semestersRouters);
app.use("/api/rooms", roomsRouters);
app.use("/api/schedules", schedulesRouters);
app.use("/api/lecturer-availabilities", lecturerAvailabilityRouters);
app.use("/api/roles", rolesRouters);
app.use("/api/assignments", assignmentsRouters);  
app.use("/api/assignment-history", assignmentHistoryRouters);
app.use("/api/classes", classesRouters);
app.use("/api/courses", coursesRouters);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server đang chạy ở cổng ${PORT}`);
  });
});
