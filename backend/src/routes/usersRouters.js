import express from "express";
import { createUser, deleteUser, getAllUsers, updateUser } from "../controllers/usersControllers.js";
import { authenticate, authorize } from "../middlewares/auth.js";


const routes = express.Router();

routes.use(authenticate, authorize("ADMIN"));
routes.get("/", getAllUsers);
routes.post("/", createUser);
routes.put("/:id", updateUser);
routes.delete("/:id", deleteUser);

export default routes;
