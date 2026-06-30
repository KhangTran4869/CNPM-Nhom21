import express from "express";
import { createRoom, deleteRoom, getAllRooms, updateRoom } from "../controllers/roomsControllers.js";
import { authenticate } from "../middlewares/auth.js";

const routes = express.Router();

routes.use(authenticate);
routes.get("/", getAllRooms);
routes.post("/", createRoom);
routes.put("/:id", updateRoom);
routes.delete("/:id", deleteRoom);

export default routes;