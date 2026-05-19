import express from "express";
import { getAllLecturers, createLecturer, updateLecturer, deleteLecturer } from "../controllers/lecturersControllers.js";

const routes = express.Router();

routes.get("/", getAllLecturers);
routes.post("/", createLecturer);
routes.put("/:id", updateLecturer);
routes.delete("/:id", deleteLecturer);

export default routes;