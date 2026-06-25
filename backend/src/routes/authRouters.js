import express from "express";
import { changePassword, login, me } from "../controllers/authController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.post("/change-password", authenticate, changePassword);
routes.get("/me", authenticate, authorize("ADMIN", "HEAD", "LECTURER"), me);

export default routes;
