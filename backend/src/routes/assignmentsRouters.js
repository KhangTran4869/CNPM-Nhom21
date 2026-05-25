import express from "express";
import { createAssignment, getAllAssignments, updateAssignment, deleteAssignment } from "../controllers/assignmentsControllers.js";

const routes = express.Router();

routes.get("/", getAllAssignments);
routes.post("/", createAssignment);
routes.put("/:id", updateAssignment);
routes.delete("/:id", deleteAssignment);

export default routes;