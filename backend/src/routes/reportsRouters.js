import express from "express";
import { assignmentReport, exportAssignments, lecturerWorkloads } from "../controllers/reportsController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/lecturer-workloads", authorize("ADMIN", "HEAD"), lecturerWorkloads);
routes.get("/assignments", authorize("ADMIN", "HEAD"), assignmentReport);
routes.get("/assignments/export", authorize("ADMIN"), exportAssignments);

export default routes;
