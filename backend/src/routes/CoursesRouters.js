import express from "express";
import { createCourse, deleteCourse, getAllCourses, updateCourse } from "../controllers/couresControllers.js";

const routes = express.Router();

routes.get("/", getAllCourses);
routes.post("/", createCourse);
routes.put("/:id", updateCourse);
routes.delete("/:id", deleteCourse);

export default routes;