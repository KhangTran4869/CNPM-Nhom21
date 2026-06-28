import express from "express";
import { changePassword, login, me, updateProfile } from "../controllers/authController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.post("/change-password", authenticate, changePassword);
routes.get("/me", authenticate, authorize("ADMIN", "HEAD", "LECTURER"), me);
routes.put("/profile", authenticate, authorize("ADMIN", "HEAD", "LECTURER"), updateProfile);

export default routes;
