import express from "express";
import { createLecturerAvailability, deleteLecturerAvailability, getAllLecturerAvailabilities, updateLecturerAvailability } from "../controllers/lecturerAvailabilityControllers.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", authorize("ADMIN", "HEAD", "LECTURER"), getAllLecturerAvailabilities);
routes.post("/", authorize("ADMIN", "LECTURER"), createLecturerAvailability);
routes.put("/:id", authorize("ADMIN", "LECTURER"), updateLecturerAvailability);
routes.delete("/:id", authorize("ADMIN", "LECTURER"), deleteLecturerAvailability);

export default routes;
