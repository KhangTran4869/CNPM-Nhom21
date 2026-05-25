import express from "express";
import { createLecturerAvailability, deleteLecturerAvailability, getAllLecturerAvailabilities, updateLecturerAvailability } from "../controllers/lecturerAvailabilityControllers.js";

const routes = express.Router();

routes.get("/", getAllLecturerAvailabilities);
routes.post("/", createLecturerAvailability);
routes.put("/:id", updateLecturerAvailability);
routes.delete("/:id", deleteLecturerAvailability);

export default routes;