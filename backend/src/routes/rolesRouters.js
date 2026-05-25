import express from "express";
import { createRole, deleteRole, getAllRoles, updateRole } from "../controllers/rolesControllers.js";

const routes = express.Router();

routes.get("/", getAllRoles);
routes.post("/", createRole);
routes.put("/:id", updateRole);
routes.delete("/:id", deleteRole);

export default routes;