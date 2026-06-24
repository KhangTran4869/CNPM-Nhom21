import User from "../models/User.js";
import Lecturer from "../models/Lecturer.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { roleCodeOf } from "../utils/constants.js";
import { signToken } from "../utils/jwt.js";
import { verifyPassword } from "../utils/password.js";

const publicUser = async (user) => {
  const lecturer = await Lecturer.findOne({ user_id: user._id, is_deleted: false })
    .populate("department_id")
    .lean();

  return {
    id: user._id,
    username: user.username,
    role: roleCodeOf(user),
    status: user.status,
    lecturer_id: lecturer?._id || null,
    name: lecturer?.name || user.username,
    code: lecturer?.code || null,
    email: lecturer?.email || null,
    phone: lecturer?.phone || null,
    degree: lecturer?.degree || null,
    department: lecturer?.department_id?.name || null,
    department_id: lecturer?.department_id?._id || null,
    max_hours: lecturer?.max_hours || null,
    lecturer_status: lecturer?.status || null,
  };
};

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return errorResponse(res, "Dữ liệu không hợp lệ", ["USERNAME_PASSWORD_REQUIRED"], 400);
  }

  const user = await User.findOne({ username, is_deleted: false }).populate("role_id");
  if (!user || user.status !== "ACTIVE") {
    return errorResponse(res, "Tên đăng nhập hoặc mật khẩu không đúng", ["INVALID_CREDENTIALS"], 401);
  }

  const matched = await verifyPassword(password, user.password_hash);
  if (!matched) {
    return errorResponse(res, "Tên đăng nhập hoặc mật khẩu không đúng", ["INVALID_CREDENTIALS"], 401);
  }

  const accessToken = signToken({ id: user._id, role: roleCodeOf(user) });
  return successResponse(
    res,
    { access_token: accessToken, user: await publicUser(user) },
    "Đăng nhập thành công",
  );
});

export const me = asyncHandler(async (req, res) => {
  return successResponse(res, await publicUser(req.user), "Thao tác thành công");
});
