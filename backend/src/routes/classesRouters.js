import express from "express";
import { createClass, getAllClasses, updateClass, deleteClass } from "../controllers/classesControllers.js";

const routes = express.Router();

routes.get("/", getAllClasses);
routes.post("/", createClass);
routes.put("/:id", updateClass);
routes.delete("/:id", deleteClass);

export default routes;