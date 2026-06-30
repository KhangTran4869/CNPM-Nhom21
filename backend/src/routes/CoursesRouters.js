import express from "express";
import { createCourse, deleteCourse, getAllCourses, updateCourse } from "../controllers/couresControllers.js";
import { authenticate } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", getAllCourses);
routes.post("/", createCourse);
routes.put("/:id", updateCourse);
routes.delete("/:id", deleteCourse);

export default routes;