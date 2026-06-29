import express from "express";
import { createAssignment, getAllAssignments, getAssignmentById, updateAssignment, deleteAssignment, approve, reject, propose, changeLecturerController, check, autoAssign } from "../controllers/assignmentsControllers.js";
import { getAllAssignmentsHistory } from "../controllers/assignmentHistoryController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", authorize("ADMIN", "HEAD", "LECTURER"), getAllAssignments);
routes.post("/propose", authorize("ADMIN", "HEAD"), propose);
routes.post("/check", authorize("ADMIN", "HEAD"), check);
routes.post("/auto-assign", authorize("ADMIN", "HEAD"), autoAssign);
routes.post("/", authorize("ADMIN"), createAssignment);
routes.patch("/:id/approve", authorize("ADMIN"), approve);
routes.patch("/:id/reject", authorize("ADMIN"), reject);
routes.patch("/:id/change-lecturer", authorize("ADMIN", "HEAD"), changeLecturerController);
routes.get("/:assignment_id/history", authorize("ADMIN", "HEAD"), getAllAssignmentsHistory);
routes.get("/:id", authorize("ADMIN", "HEAD", "LECTURER"), getAssignmentById);
routes.put("/:id", authorize("ADMIN", "HEAD"), updateAssignment);
routes.delete("/:id", authorize("ADMIN"), deleteAssignment);

export default routes;
