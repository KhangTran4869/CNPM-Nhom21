import express from "express";
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../controllers/departmentsControllers.js";
import { authenticate } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", getAllDepartments);
routes.post("/", createDepartment);
routes.put("/:id", updateDepartment);
routes.delete("/:id", deleteDepartment);

export default routes;