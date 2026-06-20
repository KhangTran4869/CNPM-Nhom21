import express from "express";
import { createAssignmentHistory, getAllAssignmentsHistory, updateAssignmentHistory, deleteAssignmentHistory } from "../controllers/assignmentHistoryController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate, authorize("ADMIN", "HEAD"));
routes.get("/", getAllAssignmentsHistory);
routes.post("/", authorize("ADMIN"), createAssignmentHistory);
routes.put("/:id", authorize("ADMIN"), updateAssignmentHistory);
routes.delete("/:id", authorize("ADMIN"), deleteAssignmentHistory);

export default routes;
