import express from "express";
import { createAssignment, getAllAssignments, getAssignmentById, updateAssignment, deleteAssignment, approve, reject, propose, changeLecturerController, check, autoAssign } from "../controllers/assignmentsControllers.js";
import { getAllAssignmentsHistory } from "../controllers/assignmentHistoryController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", authorize("ADMIN", "HEAD", "LECTURER"), getAllAssignments);
routes.post("/propose", authorize("HEAD"), propose);
routes.post("/check", authorize("HEAD"), check);
routes.post("/auto-assign", authorize("HEAD"), autoAssign);
routes.post("/", authorize("HEAD"), createAssignment);
routes.patch("/:id/approve", authorize("HEAD"), approve);
routes.patch("/:id/reject", authorize("HEAD"), reject);
routes.patch("/:id/change-lecturer", authorize("HEAD"), changeLecturerController);
routes.get("/:assignment_id/history", authorize("ADMIN", "HEAD"), getAllAssignmentsHistory);
routes.get("/:id", authorize("ADMIN", "HEAD", "LECTURER"), getAssignmentById);
routes.put("/:id", authorize("HEAD"), updateAssignment);
routes.delete("/:id", authorize("HEAD"), deleteAssignment);

export default routes;
