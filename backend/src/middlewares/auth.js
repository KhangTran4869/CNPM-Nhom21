import User from "../models/User.js";
import Lecturer from "../models/Lecturer.js";
import { errorResponse } from "../utils/apiResponse.js";
import { normalizeCode, roleCodeOf } from "../utils/constants.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
      return errorResponse(res, "Chưa đăng nhập", ["TOKEN_REQUIRED"], 401);
    }

    const decoded = verifyToken(token);
    const user = await User.findOne({
      _id: decoded.id,
      is_deleted: false,
    }).populate("role_id");

    if (!user) {
      return errorResponse(res, "Chưa đăng nhập", ["USER_NOT_FOUND"], 401);
    }

    req.user = user;
    req.userRole = roleCodeOf(user);
    let lecturer = await Lecturer.findOne({
      user_id: user._id,
      is_deleted: false,
    });

    if (!lecturer && req.userRole === "LECTURER") {
      lecturer = await Lecturer.findOne({
        $or: [
          { code: user.username.toUpperCase() },
          { email: user.email },
        ],
        is_deleted: false,
      });
      if (lecturer && !lecturer.user_id) {
        lecturer.user_id = user._id;
        await lecturer.save();
      } else if (!lecturer) {
        lecturer = await Lecturer.create({
          user_id: user._id,
          code: user.username.toUpperCase(),
          name: user.username,
          email: user.email || "",
          phone: "",
          degree: "",
          taught_hours: 0,
        });
      }
    }
    req.lecturer = lecturer;
    next();
  } catch (error) {
    return errorResponse(res, "Chưa đăng nhập", [error.message], 401);
  }
};

export const authorize = (...roles) => (req, res, next) => {
  const allowed = roles.map(normalizeCode);
  if (!req.user || !allowed.includes(req.userRole)) {
    return errorResponse(res, "Không có quyền", ["FORBIDDEN"], 403);
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  return authenticate(req, res, next);
};
