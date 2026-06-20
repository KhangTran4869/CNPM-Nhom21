import Assignment from "../models/Assignment.js";
import Lecturer from "../models/Lecturer.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { LECTURER_STATUSES, normalizeCode } from "../utils/constants.js";
import { getCurrentHours } from "../services/conflictService.js";

const ownLecturer = (req, id) => req.lecturer && String(req.lecturer._id) === String(id);

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
  const lecturers = await Lecturer.find(filter)
    .populate("department_id user_id")
    .sort({ createdAt: "desc" })
    .skip((page - 1) * limit)
    .limit(limit);
  return successResponse(res, lecturers);
});

export const createLecturer = asyncHandler(async (req, res) => {
  const { code, name, email, phone, degree, department_id, user_id, max_hours, status = "ACTIVE" } = req.body;
  if (!code || !name || !LECTURER_STATUSES.includes(normalizeCode(status))) {
    return errorResponse(res, "Dữ liệu không hợp lệ", ["CODE_NAME_STATUS_REQUIRED"], 400);
  }
  const lecturer = await Lecturer.create({
    code,
    name,
    email,
    phone,
    degree,
    department_id,
    user_id,
    max_hours,
    status: normalizeCode(status),
  });
  return successResponse(res, lecturer, "Tạo giảng viên thành công", 201);
});

export const updateLecturer = asyncHandler(async (req, res) => {
  if (req.userRole === "LECTURER" && !ownLecturer(req, req.params.id)) {
    return errorResponse(res, "Không có quyền", ["FORBIDDEN"], 403);
  }

  const allowed = ["name", "email", "phone", "degree"];
  if (req.userRole === "ADMIN") {
    allowed.push("department_id", "user_id", "max_hours", "status");
  }

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.status) updates.status = normalizeCode(updates.status);

  const lecturer = await Lecturer.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    updates,
    { new: true },
  );
  if (!lecturer) return errorResponse(res, "Giảng viên không tồn tại", ["LECTURER_NOT_FOUND"], 404);
  return successResponse(res, lecturer);
});

export const updateMaxHours = asyncHandler(async (req, res) => {
  const lecturer = await Lecturer.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { max_hours: req.body.max_hours },
    { new: true },
  );
  if (!lecturer) return errorResponse(res, "Giảng viên không tồn tại", ["LECTURER_NOT_FOUND"], 404);
  return successResponse(res, lecturer);
});

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
