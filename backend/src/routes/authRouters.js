import express from "express";
import { login, me } from "../controllers/authController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.get("/me", authenticate, authorize("ADMIN", "HEAD", "LECTURER"), me);

export default routes;
