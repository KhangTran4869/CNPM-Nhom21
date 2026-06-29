import express from "express";
import { assignmentReport, assignmentSummary, exportAssignments, exportWorkloads, lecturerWorkloads } from "../controllers/reportsController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/lecturer-workloads", authorize("ADMIN", "HEAD"), lecturerWorkloads);
routes.get("/lecturer-workloads/export", authorize("ADMIN"), exportWorkloads);
routes.get("/assignments", authorize("ADMIN", "HEAD"), assignmentReport);
routes.get("/assignments/summary", authorize("ADMIN", "HEAD"), assignmentSummary);
routes.get("/assignments/export", authorize("ADMIN"), exportAssignments);

export default routes;
