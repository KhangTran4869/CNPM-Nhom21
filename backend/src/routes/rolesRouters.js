import express from "express";
import { createRole, deleteRole, getAllRoles, updateRole } from "../controllers/rolesControllers.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate, authorize("ADMIN"));
routes.get("/", getAllRoles);
routes.post("/", createRole);
routes.put("/:id", updateRole);
routes.delete("/:id", deleteRole);

export default routes;
