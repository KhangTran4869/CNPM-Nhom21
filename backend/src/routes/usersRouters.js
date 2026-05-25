import express from "express";
import { createUser, deleteUser, getAllUsers, updateUser } from "../controllers/usersControllers.js";


const routes = express.Router();

routes.get("/", getAllUsers);
routes.post("/", createUser);
routes.put("/:id", updateUser);
routes.delete("/:id", deleteUser);

export default routes;