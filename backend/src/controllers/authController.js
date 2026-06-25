import User from "../models/User.js";
import Lecturer from "../models/Lecturer.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { roleCodeOf } from "../utils/constants.js";
import { signToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const publicUser = async (user) => {
  const lecturer = await Lecturer.findOne({ user_id: user._id, is_deleted: false })
    .populate("department_id")
    .lean();

  return {
    id: user._id,
    username: user.username,
    role: roleCodeOf(user),
    status: user.status,
    must_change_password: user.must_change_password || false,
    lecturer_id: lecturer?._id || null,
    name: lecturer?.name || user.username,
    code: lecturer?.code || null,
    email: lecturer?.email || null,
    phone: lecturer?.phone || null,
    degree: lecturer?.degree || null,
    faculty: lecturer?.faculty || "Khoa Công nghệ thông tin",
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

  if (password === "123456" && !user.must_change_password) {
    user.must_change_password = true;
    await user.save();
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

export const changePassword = asyncHandler(async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!new_password || new_password.length < 6) {
    return errorResponse(res, "Mật khẩu mới phải có ít nhất 6 ký tự", ["PASSWORD_MIN_6"], 400);
  }
  if (new_password === "123456") {
    return errorResponse(res, "Vui lòng chọn mật khẩu khác mật khẩu mặc định 123456", ["PASSWORD_TOO_SIMPLE"], 400);
  }

  const user = await User.findById(req.user._id);
  if (!user) return errorResponse(res, "Người dùng không tồn tại", ["USER_NOT_FOUND"], 404);

  if (old_password) {
    const matched = await verifyPassword(old_password, user.password_hash);
    if (!matched) return errorResponse(res, "Mật khẩu cũ không đúng", ["INVALID_OLD_PASSWORD"], 400);
  }

  user.password_hash = await hashPassword(new_password);
  user.must_change_password = false;
  await user.save();

  return successResponse(res, await publicUser(user), "Đổi mật khẩu thành công");
});
