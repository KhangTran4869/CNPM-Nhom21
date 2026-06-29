import express from "express";
import { getAllLecturers, createLecturer, updateLecturer, deleteLecturer, updateLecturerStatus, updateMaxHours, getWorkload } from "../controllers/lecturersControllers.js";
import { getAllLecturerAvailabilities, createLecturerAvailability } from "../controllers/lecturerAvailabilityControllers.js";
import { getLecturerTeachingSchedule } from "../controllers/teachingController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", authorize("ADMIN", "HEAD", "LECTURER"), getAllLecturers);
routes.post("/", authorize("ADMIN"), createLecturer);
routes.put("/:id", authorize("ADMIN", "LECTURER"), updateLecturer);
routes.patch("/:id/max-hours", authorize("ADMIN"), updateMaxHours);
routes.patch("/:id/status", authorize("ADMIN"), updateLecturerStatus);
routes.delete("/:id", authorize("ADMIN"), deleteLecturer);
routes.get("/:lecturer_id/availability", authorize("ADMIN", "HEAD", "LECTURER"), getAllLecturerAvailabilities);
routes.post("/:lecturer_id/availability", authorize("ADMIN", "LECTURER"), createLecturerAvailability);
routes.get("/:lecturer_id/teaching-schedule", authorize("ADMIN", "HEAD", "LECTURER"), getLecturerTeachingSchedule);
routes.get("/:lecturer_id/workload", authorize("ADMIN", "HEAD", "LECTURER"), getWorkload);

export default routes;
