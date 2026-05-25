import express from "express";
import { createSchedule, deleteSchedule, getAllSchedules, updateSchedule } from "../controllers/schedulesControllers.js";

const routes = express.Router();

routes.get("/", getAllSchedules);
routes.post("/", createSchedule);
routes.put("/:id", updateSchedule);
routes.delete("/:id", deleteSchedule);

export default routes;