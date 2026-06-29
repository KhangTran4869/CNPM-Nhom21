import User from "../models/User.js";
import Lecturer from "../models/Lecturer.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { roleCodeOf } from "../utils/constants.js";
import { signToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

/**
 * Chuẩn hóa thông tin User trả về cho Client
 * Tự động tìm thông tin Giảng viên liên kết (nếu có) để map họ tên, khoa, bộ môn
 */
const publicUser = async (user) => {
  if (user?.populate && !user.role_id?.code) {
    await user.populate("role_id");
  }

  let lecturer = await Lecturer.findOne({ user_id: user._id, is_deleted: false })
    .populate("department_id")
    .lean();

  if (!lecturer && roleCodeOf(user) === "LECTURER") {
    lecturer = await Lecturer.findOne({
      $or: [{ code: user.username?.toUpperCase() }, { email: user.email }],
      is_deleted: false,
    })
      .populate("department_id")
      .lean();

    if (!lecturer) {
      const newLec = await Lecturer.create({
        user_id: user._id,
        code: user.username?.toUpperCase(),
        name: user.username,
        email: user.email || "",
        phone: "",
        degree: "",
        taught_hours: 0,
      });
      lecturer = newLec.toObject();
    }
  }

  const roleCode = roleCodeOf(user);

  return {
    id: user._id,
    username: user.username,
    role: roleCode,
    status: user.status,
    // Admin không bao giờ bị bắt buộc đổi mật khẩu
    must_change_password: roleCode === "ADMIN" ? false : (user.must_change_password || false),
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
    taught_hours: lecturer?.taught_hours || 0,
    preferences: lecturer?.preferences || null,
    lecturer_status: lecturer?.status || null,
  };
};

/**
 * API Đăng nhập hệ thống
 * Khi Giảng viên hoặc Trưởng khoa đăng nhập lần đầu bằng mật khẩu mặc định (123456) -> kích hoạt cờ must_change_password
 */
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

  const roleCode = roleCodeOf(user);
  // Admin không cần yêu cầu đổi mật khẩu lần đầu (nếu cờ bị bật do trước đó thì tắt đi)
  if (roleCode === "ADMIN") {
    if (user.must_change_password) {
      user.must_change_password = false;
      await user.save();
    }
  } else if (password === "123456" && !user.must_change_password) {
    // Chỉ kích hoạt đổi mật khẩu cho LECTURER và HEAD
    user.must_change_password = true;
    await user.save();
  }

  const accessToken = signToken({ id: user._id, role: roleCode });
  return successResponse(
    res,
    { access_token: accessToken, user: await publicUser(user) },
    "Đăng nhập thành công",
  );
});

/**
 * API Lấy thông tin người dùng đang đăng nhập (Me)
 */
export const me = asyncHandler(async (req, res) => {
  return successResponse(res, await publicUser(req.user), "Thao tác thành công");
});

/**
 * API Đổi mật khẩu lần đầu hoặc chủ động đổi mật khẩu
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!new_password || new_password.length < 6) {
    return errorResponse(res, "Mật khẩu mới phải có ít nhất 6 ký tự", ["PASSWORD_MIN_6"], 400);
  }
  if (new_password === "123456") {
    return errorResponse(res, "Vui lòng chọn mật khẩu khác mật khẩu mặc định 123456", ["PASSWORD_TOO_SIMPLE"], 400);
  }

  const user = await User.findById(req.user._id).populate("role_id");
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

/**
 * API Cập nhật thông tin cá nhân (Họ tên, email, sđt, học vị, nguyện vọng, số giờ đã dạy)
 * Nếu tài khoản chưa được liên kết với hồ sơ Lecturer trong CSDL, tự động tạo hồ sơ mới và liên kết.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, degree, preferences, taught_hours } = req.body;

  let lecturer = await Lecturer.findOne({ user_id: req.user._id, is_deleted: false });
  if (!lecturer) {
    lecturer = new Lecturer({
      user_id: req.user._id,
      code: req.user.username.toUpperCase(),
      name: name || req.user.username,
      email: email || "",
      phone: phone || "",
      degree: degree || "",
      preferences: preferences || null,
      taught_hours: Number(taught_hours) || 0,
      faculty: "Khoa Công nghệ thông tin",
      status: "ACTIVE",
    });
  } else {
    if (name !== undefined) lecturer.name = name;
    if (email !== undefined) lecturer.email = email;
    if (phone !== undefined) lecturer.phone = phone;
    if (degree !== undefined) lecturer.degree = degree;
    if (preferences !== undefined) lecturer.preferences = preferences;
    if (taught_hours !== undefined) lecturer.taught_hours = Number(taught_hours) || 0;
  }
  await lecturer.save();

  const updatedUser = await User.findById(req.user._id).populate("role_id");
  return successResponse(res, await publicUser(updatedUser), "Cập nhật thông tin thành công");
});

