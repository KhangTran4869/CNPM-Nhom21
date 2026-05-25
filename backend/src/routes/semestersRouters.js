import express from "express";
import { createSemester, deleteSemester, getAllSemesters, updateSemester } from "../controllers/semestersControllers.js";

const routes = express.Router();

routes.get("/", getAllSemesters);
routes.post("/", createSemester);
routes.put("/:id", updateSemester);
routes.delete("/:id", deleteSemester);

export default routes;