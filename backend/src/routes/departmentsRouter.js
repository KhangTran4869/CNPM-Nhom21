import express from "express";
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../controllers/departmentController.js";

const routes = express.Router();

routes.get("/", getAllDepartments);
routes.post("/", createDepartment);
routes.put("/:id", updateDepartment);
routes.delete("/:id", deleteDepartment);

export default routes;