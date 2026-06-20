import express from "express";
import { createClass, getAllClasses, updateClass, deleteClass, updateClassStatus, getSuggestedLecturersByClass } from "../controllers/classesControllers.js";
import { getAllSchedules, createSchedule } from "../controllers/schedulesControllers.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", authorize("ADMIN", "HEAD", "LECTURER"), getAllClasses);
routes.post("/", authorize("ADMIN"), createClass);
routes.put("/:id", authorize("ADMIN"), updateClass);
routes.patch("/:id/status", authorize("ADMIN"), updateClassStatus);
routes.delete("/:id", authorize("ADMIN"), deleteClass);
routes.get("/:class_id/schedules", authorize("ADMIN", "HEAD", "LECTURER"), getAllSchedules);
routes.post("/:class_id/schedules", authorize("ADMIN"), createSchedule);
routes.get("/:class_id/suggested-lecturers", authorize("ADMIN", "HEAD"), getSuggestedLecturersByClass);

export default routes;
