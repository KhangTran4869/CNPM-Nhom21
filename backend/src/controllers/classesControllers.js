import Assignment from "../models/Assignment.js";
import Class from "../models/Class.js";
import Course from "../models/Course.js";
import Semester from "../models/Semester.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { CLASS_STATUSES, normalizeCode } from "../utils/constants.js";
import { getSuggestedLecturers } from "../services/conflictService.js";

const hasApprovedAssignment = (classId) =>
  Assignment.exists({ class_id: classId, status: "APPROVED", is_deleted: false });

export const getAllClasses = asyncHandler(async (req, res) => {
  const filter = { is_deleted: false };
  if (req.query.semester_id) filter.semester_id = req.query.semester_id;
  if (req.query.course_id) filter.course_id = req.query.course_id;
  if (req.query.status) filter.status = normalizeCode(req.query.status);
  if (req.query.keyword) filter.code = { $regex: req.query.keyword, $options: "i" };
  const classes = await Class.find(filter)
    .populate("course_id semester_id")
    .sort({ createdAt: "desc" });
  return successResponse(res, classes);
});

export const createClass = asyncHandler(async (req, res) => {
  const { code, course_id, semester_id, max_students } = req.body;
  const errors = [];
  if (!code) errors.push("CODE_REQUIRED");
  if (await Class.exists({ code, is_deleted: false })) errors.push("CLASS_CODE_EXISTS");
  if (!(await Course.exists({ _id: course_id, is_deleted: false }))) errors.push("COURSE_NOT_FOUND");
  if (!(await Semester.exists({ _id: semester_id, is_deleted: false }))) errors.push("SEMESTER_NOT_FOUND");
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);

  const classDoc = await Class.create({
    code,
    course_id,
    semester_id,
    max_students,
    status: "OPEN",
  });
  return successResponse(res, classDoc, "Tạo lớp tín chỉ thành công", 201);
});

export const updateClass = asyncHandler(async (req, res) => {
  if (await hasApprovedAssignment(req.params.id)) {
    return errorResponse(res, "Không thể sửa lớp đã có phân công được duyệt", ["ASSIGNMENT_LOCKED"], 409);
  }
  const updates = {};
  for (const key of ["code", "course_id", "semester_id", "max_students"]) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const classDoc = await Class.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    updates,
    { new: true },
  );
  if (!classDoc) return errorResponse(res, "Lớp học không tồn tại", ["CLASS_NOT_FOUND"], 404);
  return successResponse(res, classDoc);
});

export const updateClassStatus = asyncHandler(async (req, res) => {
  const status = normalizeCode(req.body.status);
  if (!CLASS_STATUSES.includes(status)) {
    return errorResponse(res, "Dữ liệu không hợp lệ", ["INVALID_STATUS"], 400);
  }
  const classDoc = await Class.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { status },
    { new: true },
  );
  if (!classDoc) return errorResponse(res, "Lớp học không tồn tại", ["CLASS_NOT_FOUND"], 404);
  return successResponse(res, classDoc);
});

export const getSuggestedLecturersByClass = asyncHandler(async (req, res) => {
  if (!req.params.class_id.match(/^[0-9a-fA-F]{24}$/)) {
    return errorResponse(res, "Lớp học không tồn tại", ["CLASS_NOT_FOUND"], 404);
  }
  const suggestions = await getSuggestedLecturers(req.params.class_id);
  if (!suggestions) return errorResponse(res, "Lớp học không tồn tại", ["CLASS_NOT_FOUND"], 404);
  return successResponse(res, suggestions);
});

export const deleteClass = asyncHandler(async (req, res) => {
  const classDoc = await Class.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true },
  );
  if (!classDoc) return errorResponse(res, "Lớp học không tồn tại", ["CLASS_NOT_FOUND"], 404);
  return successResponse(res, classDoc, "Lớp học đã được xóa");
});
