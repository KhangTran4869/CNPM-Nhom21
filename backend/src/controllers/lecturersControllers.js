import Assignment from "../models/Assignment.js";
import Department from "../models/Department.js";
import Lecturer from "../models/Lecturer.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { LECTURER_STATUSES, normalizeCode } from "../utils/constants.js";
import { hashPassword } from "../utils/password.js";
import { getCurrentHours } from "../services/conflictService.js";

// Kiểm tra quyền sở hữu giảng viên (dành cho role LECTURER tự cập nhật chính mình)
const ownLecturer = (req, id) => req.lecturer && String(req.lecturer._id) === String(id);

/**
 * Đảm bảo giảng viên có tài khoản đăng nhập hợp lệ
 * - Nếu truyền user_id có sẵn: kiểm tra tồn tại và gán quyền LECTURER cho user đó
 * - Nếu không truyền: tự động tạo tài khoản (Username = Mã GV, Mật khẩu = 123456)
 */
const ensureLecturerUser = async ({ code, user_id }) => {
  if (user_id) {
    const user = await User.findOne({ _id: user_id, is_deleted: false }).populate("role_id");
    if (!user) return { error: "USER_NOT_FOUND" };
    const linked = await Lecturer.exists({ user_id: user._id, is_deleted: false });
    if (linked) return { error: "USER_ALREADY_LINKED" };

    // Đảm bảo user được gán đúng role LECTURER
    const lecturerRole = await Role.findOne({ code: "LECTURER", is_deleted: false });
    if (lecturerRole && String(user.role_id?._id || user.role_id) !== String(lecturerRole._id)) {
      user.role_id = lecturerRole._id;
      await user.save();
    }
    return { user };
  }

  // Lấy hoặc tạo Role LECTURER
  const lecturerRole = await Role.findOneAndUpdate(
    { code: "LECTURER" },
    { code: "LECTURER", name: "Giảng viên", is_deleted: false },
    { upsert: true, new: true },
  );
  const username = String(code).trim().toLowerCase();
  const existing = await User.findOne({ username, is_deleted: false });

  if (existing) {
    const linked = await Lecturer.exists({ user_id: existing._id, is_deleted: false });
    if (linked) return { error: "USER_ALREADY_LINKED" };
    existing.role_id = lecturerRole._id;
    existing.status = "ACTIVE";
    await existing.save();
    return { user: existing };
  }

  const user = await User.create({
    username,
    password_hash: await hashPassword("123456"),
    role_id: lecturerRole._id,
    status: "ACTIVE",
    must_change_password: true,
  });
  return { user };
};

/**
 * Lấy danh sách giảng viên (lọc theo bộ môn, trạng thái, từ khóa)
 */
export const getAllLecturers = asyncHandler(async (req, res) => {
  const filter = { is_deleted: false };
  if (req.query.department_id) filter.department_id = req.query.department_id;
  if (req.query.status) filter.status = normalizeCode(req.query.status);
  if (req.query.keyword) {
    filter.$or = [
      { code: { $regex: req.query.keyword, $options: "i" } },
      { name: { $regex: req.query.keyword, $options: "i" } },
      { email: { $regex: req.query.keyword, $options: "i" } },
    ];
  }
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const allLecturers = await Lecturer.find(filter)
    .populate({ path: "user_id", populate: { path: "role_id" } })
    .populate("department_id")
    .sort({ createdAt: "desc" });

  const validLecturers = allLecturers.filter((item) => {
    const roleCode = item.user_id?.role_id?.code || item.user_id?.role;
    if (roleCode === "HEAD" || roleCode === "ADMIN") return false;
    const codeStr = (item.code || "").toUpperCase();
    const nameStr = (item.name || "").toUpperCase();
    if (codeStr.includes("TRUONGKHOA") || codeStr.includes("ADMIN")) return false;
    if (nameStr.includes("TRƯỞNG KHOA") || nameStr === "ADMIN") return false;
    return true;
  });

  const paginated = validLecturers.slice((page - 1) * limit, page * limit);
  return successResponse(res, paginated);
});

/**
 * Thêm giảng viên mới (hỗ trợ tự động sinh mã GV001 nếu bỏ trống)
 */
export const createLecturer = asyncHandler(async (req, res) => {
  let {
    code,
    name,
    email,
    phone,
    degree,
    faculty = "Khoa Công nghệ thông tin",
    department_id,
    user_id,
    max_hours,
    preferences,
    taught_hours = 0,
    status = "ACTIVE",
  } = req.body;

  // Thuật toán tự sinh mã GV001, GV002... tuần tự nếu để trống
  if (!code || code.trim() === "") {
    const count = await Lecturer.countDocuments();
    let nextNum = count + 1;
    let autoCode = `GV${String(nextNum).padStart(3, "0")}`;
    while (await Lecturer.exists({ code: autoCode })) {
      nextNum++;
      autoCode = `GV${String(nextNum).padStart(3, "0")}`;
    }
    code = autoCode;
  }

  const errors = [];
  if (!name) errors.push("NAME_REQUIRED");
  if (!LECTURER_STATUSES.includes(normalizeCode(status))) errors.push("INVALID_STATUS");
  if (!department_id) errors.push("DEPARTMENT_REQUIRED");
  if (department_id && !mongoose.isValidObjectId(department_id)) errors.push("DEPARTMENT_ID_INVALID");
  if (user_id && !mongoose.isValidObjectId(user_id)) errors.push("USER_ID_INVALID");
  if (await Lecturer.exists({ code, is_deleted: false })) errors.push("LECTURER_CODE_EXISTS");
  if (errors.length) {
    return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);
  }

  const department = await Department.findOne({ _id: department_id, is_deleted: false });
  if (!department) return errorResponse(res, "Bộ môn không tồn tại", ["DEPARTMENT_NOT_FOUND"], 400);

  const account = await ensureLecturerUser({ code, user_id });
  if (account.error) return errorResponse(res, "Dữ liệu không hợp lệ", [account.error], 400);

  const lecturer = await Lecturer.create({
    code,
    name,
    email,
    phone,
    degree,
    faculty,
    department_id,
    user_id: account.user._id,
    max_hours,
    preferences,
    taught_hours: Number(taught_hours) || 0,
    status: normalizeCode(status),
  });
  const populated = await lecturer.populate("department_id user_id");
  return successResponse(res, populated, "Tạo giảng viên thành công", 201);
});

/**
 * Cập nhật thông tin giảng viên (Khoa, bộ môn, học vị, liên kết user)
 */
export const updateLecturer = asyncHandler(async (req, res) => {
  if (req.userRole === "LECTURER" && !ownLecturer(req, req.params.id)) {
    return errorResponse(res, "Không có quyền", ["FORBIDDEN"], 403);
  }

  const allowed = ["name", "email", "phone", "degree", "faculty", "preferences", "taught_hours"];
  if (req.userRole === "ADMIN") {
    allowed.push("department_id", "user_id", "max_hours", "status");
  }

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined && req.body[key] !== "") updates[key] = req.body[key];
  }
  if (updates.department_id && !mongoose.isValidObjectId(updates.department_id)) {
    return errorResponse(res, "Dữ liệu không hợp lệ", ["DEPARTMENT_ID_INVALID"], 400);
  }
  if (updates.user_id && !mongoose.isValidObjectId(updates.user_id)) {
    return errorResponse(res, "Dữ liệu không hợp lệ", ["USER_ID_INVALID"], 400);
  }
  if (updates.status) updates.status = normalizeCode(updates.status);

  // Nếu Admin cập nhật liên kết user mới -> kiểm tra trùng lặp và cập nhật role user
  if (updates.user_id) {
    const linked = await Lecturer.exists({
      user_id: updates.user_id,
      _id: { $ne: req.params.id },
      is_deleted: false,
    });
    if (linked) {
      return errorResponse(res, "Tài khoản này đã liên kết với giảng viên khác", ["USER_ALREADY_LINKED"], 400);
    }
    const lecturerRole = await Role.findOne({ code: "LECTURER", is_deleted: false });
    if (lecturerRole) {
      await User.findOneAndUpdate({ _id: updates.user_id }, { role_id: lecturerRole._id });
    }
  }

  const lecturer = await Lecturer.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    updates,
    { new: true },
  ).populate("department_id user_id");

  if (!lecturer) return errorResponse(res, "Giảng viên không tồn tại", ["LECTURER_NOT_FOUND"], 404);
  return successResponse(res, lecturer, "Cập nhật giảng viên thành công");
});

/**
 * Cập nhật giờ chuẩn tối đa
 */
export const updateMaxHours = asyncHandler(async (req, res) => {
  const lecturer = await Lecturer.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { max_hours: req.body.max_hours },
    { new: true },
  );
  if (!lecturer) return errorResponse(res, "Giảng viên không tồn tại", ["LECTURER_NOT_FOUND"], 404);
  return successResponse(res, lecturer);
});

/**
 * Cập nhật trạng thái giảng viên
 */
export const updateLecturerStatus = asyncHandler(async (req, res) => {
  const status = normalizeCode(req.body.status);
  if (!LECTURER_STATUSES.includes(status)) {
    return errorResponse(res, "Dữ liệu không hợp lệ", ["INVALID_STATUS"], 400);
  }
  const lecturer = await Lecturer.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { status },
    { new: true },
  );
  if (!lecturer) return errorResponse(res, "Giảng viên không tồn tại", ["LECTURER_NOT_FOUND"], 404);
  return successResponse(res, lecturer);
});

/**
 * Tính toán tải giảng dạy (Workload) hiện tại của giảng viên trong học kỳ
 */
export const getWorkload = asyncHandler(async (req, res) => {
  if (!req.query.semester_id) {
    return errorResponse(res, "Dữ liệu không hợp lệ", ["SEMESTER_REQUIRED"], 400);
  }
  if (req.userRole === "LECTURER" && !ownLecturer(req, req.params.lecturer_id)) {
    return errorResponse(res, "Không có quyền", ["FORBIDDEN"], 403);
  }
  const lecturer = await Lecturer.findOne({ _id: req.params.lecturer_id, is_deleted: false });
  if (!lecturer) return errorResponse(res, "Giảng viên không tồn tại", ["LECTURER_NOT_FOUND"], 404);
  const totalHours = await getCurrentHours(lecturer._id, req.query.semester_id);
  const remainingHours = Number(lecturer.max_hours || 0) - totalHours;
  return successResponse(res, {
    lecturer_id: lecturer._id,
    total_hours: totalHours,
    max_hours: lecturer.max_hours,
    remaining_hours: remainingHours,
    status: totalHours > Number(lecturer.max_hours || 0) ? "OVERLOAD" : "NORMAL",
  });
});

/**
 * Xóa mềm giảng viên (Từ chối nếu đang có phân công giảng dạy đã duyệt)
 */
export const deleteLecturer = asyncHandler(async (req, res) => {
  const hasApproved = await Assignment.exists({
    lecturer_id: req.params.id,
    status: "APPROVED",
    is_deleted: false,
  });
  if (hasApproved) {
    return errorResponse(res, "Không thể xóa giảng viên đang có phân công đã duyệt", ["ASSIGNMENT_LOCKED"], 409);
  }
  const lecturer = await Lecturer.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true },
  );
  if (!lecturer) return errorResponse(res, "Giảng viên không tồn tại", ["LECTURER_NOT_FOUND"], 404);
  return successResponse(res, lecturer, "Giảng viên đã được xóa");
});
