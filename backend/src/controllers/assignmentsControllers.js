import Assignment from "../models/Assignment.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { normalizeCode } from "../utils/constants.js";
import {
  approveAssignment,
  changeLecturer,
  createAssignmentDirect,
  proposeAssignment,
  rejectAssignment,
  softDeleteAssignment,
} from "../services/assignmentService.js";
import { checkAssignmentEligibility } from "../services/conflictService.js";

export const getAllAssignments = asyncHandler(async (req, res) => {
  const filter = { is_deleted: false };
  for (const key of ["lecturer_id", "class_id"]) {
    if (req.query[key]) filter[key] = req.query[key];
  }
  if (req.query.status) filter.status = normalizeCode(req.query.status);
  if (req.userRole === "LECTURER") filter.lecturer_id = req.lecturer?._id;

  let query = Assignment.find(filter)
    .populate({
      path: "class_id",
      populate: [{ path: "course_id" }, { path: "semester_id" }],
    })
    .populate({ path: "lecturer_id", populate: "department_id" })
    .populate("assigned_by")
    .sort({ createdAt: "desc" });

  let assignments = await query;
  if (req.query.semester_id) {
    assignments = assignments.filter(
      (item) =>
        String(item.class_id?.semester_id?._id || item.class_id?.semester_id) ===
        String(req.query.semester_id),
    );
  }
  if (req.query.department_id) {
    assignments = assignments.filter(
      (item) =>
        String(item.lecturer_id?.department_id?._id || item.lecturer_id?.department_id) ===
          String(req.query.department_id) ||
        String(item.class_id?.course_id?.department_id?._id || item.class_id?.course_id?.department_id) ===
          String(req.query.department_id),
    );
  }
  return successResponse(res, assignments);
});

export const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await createAssignmentDirect({ ...req.body, user: req.user });
  return successResponse(res, assignment, "Tạo phân công thành công", 201);
});

export const propose = asyncHandler(async (req, res) => {
  const assignment = await proposeAssignment({ ...req.body, user: req.user });
  return successResponse(res, assignment, "Đề xuất phân công thành công", 201);
});

export const check = asyncHandler(async (req, res) => {
  const result = await checkAssignmentEligibility({
    classId: req.body.class_id,
    lecturerId: req.body.lecturer_id,
  });
  return successResponse(
    res,
    { is_valid: result.is_valid, violations: result.violations },
    result.is_valid ? "Giảng viên phù hợp để phân công" : "Giảng viên không phù hợp để phân công",
  );
});

export const approve = asyncHandler(async (req, res) => {
  const assignment = await approveAssignment({ id: req.params.id, note: req.body.note });
  return successResponse(res, assignment, "Duyệt phân công thành công");
});

export const reject = asyncHandler(async (req, res) => {
  const assignment = await rejectAssignment({ id: req.params.id, note: req.body.note });
  return successResponse(res, assignment, "Từ chối phân công thành công");
});

export const changeLecturerController = asyncHandler(async (req, res) => {
  const assignment = await changeLecturer({
    id: req.params.id,
    new_lecturer_id: req.body.new_lecturer_id,
    note: req.body.note,
  });
  return successResponse(res, assignment, "Đổi giảng viên thành công");
});

export const updateAssignment = asyncHandler(async (_req, res) => {
  return errorResponse(res, "Không cho sửa trực tiếp phân công", ["ASSIGNMENT_LOCKED"], 409);
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await softDeleteAssignment(req.params.id);
  return successResponse(res, assignment, "Phân công đã được xóa");
});
