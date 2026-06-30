import User from "../models/User.js";
import Role from "../models/Role.js";
import Lecturer from "../models/Lecturer.js";
import Department from "../models/Department.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { normalizeCode, USER_STATUSES } from "../utils/constants.js";
import { hashPassword } from "../utils/password.js";

// Hàm xây dựng bộ lọc tìm kiếm người dùng
const buildUserQuery = (query) => {
  const filter = { is_deleted: false };
  if (query.status) filter.status = normalizeCode(query.status);
  if (query.keyword) filter.username = { $regex: query.keyword, $options: "i" };
  if (query.role) filter.role_id = query.role;
  return filter;
};

/**
 * Lấy danh sách tất cả tài khoản người dùng
 * Bổ sung trường `role` (mã vai trò) và `lecturer_id` (nếu đã liên kết giảng viên)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);

  const rawUsers = await User.find(buildUserQuery(req.query))
    .populate("role_id")
    .sort({ createdAt: "desc" })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Tìm các giảng viên đã liên kết tài khoản để map thông tin
  const lecturers = await Lecturer.find({ is_deleted: false }, "_id user_id").lean();
  const linkedMap = {};
  lecturers.forEach((l) => {
    if (l.user_id) linkedMap[String(l.user_id)] = l._id;
  });

  const users = rawUsers.map((u) => ({
    ...u,
    id: u._id,
    role: u.role_id?.code || "USER",
    lecturer_id: linkedMap[String(u._id)] || null,
  }));

  return successResponse(res, users);
});

const syncLecturerWithUser = async (user, role_id) => {
  const roleDoc = await Role.findById(role_id || user.role_id);
  if (roleDoc && (roleDoc.code === "LECTURER" || roleDoc.code === "HEAD")) {
    let lecturer = await Lecturer.findOne({ user_id: user._id, is_deleted: false });
    if (!lecturer) {
      const defaultDept = await Department.findOne({ is_deleted: false });
      const count = await Lecturer.countDocuments();
      let autoCode = `GV${String(count + 1).padStart(3, "0")}`;
      while (await Lecturer.exists({ code: autoCode })) {
        autoCode = `GV_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      }
      await Lecturer.create({
        code: autoCode,
        name: user.username,
        email: `${user.username}@gmail.com`,
        phone: "",
        degree: roleDoc.code === "HEAD" ? "Tiến sĩ" : "Thạc sĩ",
        faculty: user.faculty || "Khoa Công nghệ thông tin",
        department_id: defaultDept ? defaultDept._id : null,
        user_id: user._id,
        status: user.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      });
    } else {
      lecturer.status = user.status === "ACTIVE" ? "ACTIVE" : "INACTIVE";
      if (user.faculty) lecturer.faculty = user.faculty;
      await lecturer.save();
    }
  }
};

/**
 * Tạo mới một tài khoản người dùng từ trang Admin
 * Nếu tạo vai trò LECTURER hoặc HEAD -> tự động đồng bộ hồ sơ vào danh sách giảng viên.
 */
export const createUser = asyncHandler(async (req, res) => {
  const { username, password, role_id, status = "ACTIVE", faculty = "Khoa Công nghệ thông tin" } = req.body;
  const errors = [];
  if (!username) errors.push("USERNAME_REQUIRED");
  if (!password || password.length < 6) errors.push("PASSWORD_MIN_6");
  if (!USER_STATUSES.includes(normalizeCode(status))) errors.push("INVALID_STATUS");
  if (await User.exists({ username, is_deleted: false })) errors.push("USERNAME_EXISTS");
  if (!(await Role.exists({ _id: role_id, is_deleted: false }))) errors.push("ROLE_NOT_FOUND");
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);

  const password_hash = await hashPassword(password);
  const user = await User.create({
    username,
    password_hash,
    role_id,
    status: normalizeCode(status),
    faculty,
    must_change_password: password === "123456",
  });

  await syncLecturerWithUser(user, role_id);

  return successResponse(res, user, "Tạo người dùng thành công", 201);
});

/**
 * Cập nhật tài khoản người dùng (Sửa Vai trò, Trạng thái, hoặc Đặt lại mật khẩu)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const updates = {};

  if (req.body.password && req.body.password.trim() !== "") {
    if (req.body.password.length < 6) {
      return errorResponse(res, "Mật khẩu mới phải có ít nhất 6 ký tự", ["PASSWORD_MIN_6"], 400);
    }
    updates.password_hash = await hashPassword(req.body.password);
    updates.must_change_password = req.body.password === "123456";
  }

  if (req.body.role_id) {
    if (!(await Role.exists({ _id: req.body.role_id, is_deleted: false }))) {
      return errorResponse(res, "Dữ liệu không hợp lệ", ["ROLE_NOT_FOUND"], 400);
    }
    updates.role_id = req.body.role_id;
  }

  if (req.body.status) {
    const status = normalizeCode(req.body.status);
    if (!USER_STATUSES.includes(status)) {
      return errorResponse(res, "Dữ liệu không hợp lệ", ["INVALID_STATUS"], 400);
    }
    updates.status = status;
  }

  if (req.body.faculty !== undefined) {
    updates.faculty = req.body.faculty;
  }

  if (req.body.username && req.body.username.trim() !== "") {
    const newUsername = req.body.username.trim();
    const existing = await User.findOne({ username: newUsername, _id: { $ne: req.params.id }, is_deleted: false });
    if (existing) {
      return errorResponse(res, "Tên đăng nhập đã tồn tại", ["USERNAME_EXISTS"], 400);
    }
    updates.username = newUsername;
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    updates,
    { new: true },
  ).populate("role_id");

  if (!user) return errorResponse(res, "Người dùng không tồn tại", ["USER_NOT_FOUND"], 404);

  if (updates.username || updates.faculty) {
    const lecUpdates = {};
    if (updates.username) lecUpdates.name = updates.username;
    if (updates.faculty) lecUpdates.faculty = updates.faculty;
    await Lecturer.findOneAndUpdate(
      { user_id: user._id, is_deleted: false },
      lecUpdates
    );
  }

  await syncLecturerWithUser(user, updates.role_id);

  return successResponse(res, user, "Cập nhật tài khoản thành công");
});

/**
 * Xóa mềm tài khoản người dùng và đồng bộ xóa mềm hồ sơ giảng viên
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true, status: "INACTIVE" },
    { new: true },
  );
  if (!user) return errorResponse(res, "Người dùng không tồn tại", ["USER_NOT_FOUND"], 404);

  await Lecturer.findOneAndUpdate(
    { user_id: user._id, is_deleted: false },
    { is_deleted: true, status: "INACTIVE" }
  );

  return successResponse(res, user, "Người dùng đã được xóa");
});
