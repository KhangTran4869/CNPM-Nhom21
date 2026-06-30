import express from "express";
import { createSemester, deleteSemester, getAllSemesters, updateSemester } from "../controllers/semestersControllers.js";
import { authenticate } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", getAllSemesters);
routes.post("/", createSemester);
routes.put("/:id", updateSemester);
routes.delete("/:id", deleteSemester);

export default routes;