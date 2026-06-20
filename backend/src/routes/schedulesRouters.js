import express from "express";
import { createSchedule, deleteSchedule, getAllSchedules, updateSchedule } from "../controllers/schedulesControllers.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", authorize("ADMIN", "HEAD", "LECTURER"), getAllSchedules);
routes.post("/", authorize("ADMIN"), createSchedule);
routes.put("/:id", authorize("ADMIN"), updateSchedule);
routes.delete("/:id", authorize("ADMIN"), deleteSchedule);

export default routes;
