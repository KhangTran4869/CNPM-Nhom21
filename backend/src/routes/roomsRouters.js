import express from "express";
import { createRoom, deleteRoom, getAllRooms, updateRoom } from "../controllers/roomsControllers.js";

const routes = express.Router();

routes.get("/", getAllRooms);
routes.post("/", createRoom);
routes.put("/:id", updateRoom);
routes.delete("/:id", deleteRoom);

export default routes;