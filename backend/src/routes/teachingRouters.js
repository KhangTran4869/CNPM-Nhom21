import express from "express";
import { getMyTeachingSchedule } from "../controllers/teachingController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.get("/me/teaching-schedule", authenticate, authorize("LECTURER"), getMyTeachingSchedule);

export default routes;
