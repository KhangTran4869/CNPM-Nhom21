import express from "express";
import { createAssignmentHistory, getAllAssignmentsHistory, updateAssignmentHistory, deleteAssignmentHistory } from "../controllers/assignmentHistoryController.js";

const routes = express.Router();

routes.get("/", getAllAssignmentsHistory);
routes.post("/", createAssignmentHistory);
routes.put("/:id", updateAssignmentHistory);
routes.delete("/:id", deleteAssignmentHistory);

export default routes;