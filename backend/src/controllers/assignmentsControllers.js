import Assignment from "../models/Assignment.js";
import Class from "../models/Class.js";
import Semester from "../models/Semester.js";
import mongoose from "mongoose";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { normalizeCode } from "../utils/constants.js";
import {
  approveAssignment,
  changeLecturer,
  createAssignmentDirect,
  proposeAssignment,
  rejectAssignment,
  softDeleteAssignment,
  updateAssignmentRecord,
} from "../services/assignmentService.js";
import { checkAssignmentEligibility, getSuggestedLecturers } from "../services/conflictService.js";

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
      populate: [{ path: "course_id", populate: { path: "department_id" } }, { path: "semester_id" }],
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
  if (req.userRole === "HEAD" && req.userFaculty) {
    assignments = assignments.filter((item) => {
      const classFac = item.class_id?.course_id?.department_id?.description;
      const lecFac = item.lecturer_id?.faculty || item.lecturer_id?.department_id?.description;
      return classFac === req.userFaculty || lecFac === req.userFaculty;
    });
  }
  return successResponse(res, assignments);
});

export const getAssignmentById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return errorResponse(res, "Không tìm thấy phân công", ["ASSIGNMENT_NOT_FOUND"], 404);
  }
  const assignment = await Assignment.findOne({ _id: req.params.id, is_deleted: false })
    .populate({
      path: "class_id",
      populate: [{ path: "course_id" }, { path: "semester_id" }],
    })
    .populate({ path: "lecturer_id", populate: "department_id" })
    .populate("assigned_by");
  if (!assignment) {
    return errorResponse(res, "Không tìm thấy phân công", ["ASSIGNMENT_NOT_FOUND"], 404);
  }
  if (
    req.userRole === "LECTURER" &&
    String(assignment.lecturer_id?._id || assignment.lecturer_id) !== String(req.lecturer?._id)
  ) {
    return errorResponse(res, "Bạn không có quyền thực hiện chức năng này", ["FORBIDDEN"], 403);
  }
  return successResponse(res, assignment);
});

export const createAssignment = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const assignment = await createAssignmentDirect({ ...body, user: req.user });
  return successResponse(res, assignment, "Tạo phân công thành công", 201);
});

export const propose = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const assignment = await proposeAssignment({ ...body, user: req.user });
  return successResponse(res, assignment, "Đề xuất phân công thành công", 201);
});

export const check = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const result = await checkAssignmentEligibility({
    classId: body.class_id,
    lecturerId: body.lecturer_id,
  });
  return successResponse(
    res,
    { is_valid: result.is_valid, violations: result.violations },
    result.is_valid ? "Giảng viên phù hợp để phân công" : "Giảng viên không phù hợp để phân công",
  );
});

export const approve = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const assignment = await approveAssignment({ id: req.params.id, note: body.note });
  return successResponse(res, assignment, "Duyệt phân công thành công");
});

export const reject = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const assignment = await rejectAssignment({ id: req.params.id, note: body.note });
  return successResponse(res, assignment, "Từ chối phân công thành công");
});

export const changeLecturerController = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const assignment = await changeLecturer({
    id: req.params.id,
    new_lecturer_id: body.new_lecturer_id,
    note: body.note,
    user: req.user,
    userRole: req.userRole,
  });
  return successResponse(res, assignment, "Đổi giảng viên thành công");
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const assignment = await updateAssignmentRecord({
    id: req.params.id,
    lecturer_id: body.lecturer_id || body.new_lecturer_id,
    status: body.status,
    note: body.note,
    user: req.user,
    userRole: req.userRole,
  });
  return successResponse(res, assignment, "Cập nhật phân công thành công");
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await softDeleteAssignment(req.params.id);
  return successResponse(res, assignment, "Phân công đã được xóa");
});

/**
 * Thuật toán Phân công tự động tối ưu dành cho Trưởng khoa / Admin:
 * 1. Kiểm tra chuyên môn (bộ môn)
 * 2. Kiểm tra lịch bận (thời khóa biểu rảnh/bận khai báo của giảng viên)
 * 3. Kiểm tra định mức giờ (không vượt quá max_hours quy định)
 * 4. Cân bằng khối lượng giảng dạy (ưu tiên giảng viên đang có ít số giờ dạy nhất)
 * 5. Sinh phương án phân công (đề xuất PROPOSED để chờ Trưởng khoa duyệt chính thức)
 */
export const autoAssign = asyncHandler(async (req, res) => {
  const { semester_id } = req.body;
  if (semester_id) {
    const sem = await Semester.findById(semester_id);
    if (sem && sem.status === "COMPLETED") {
      return errorResponse(res, `Không cho phép chạy thuật toán cho học kỳ "${sem.name}" đang ở trạng thái "Đã kết thúc"!`, ["SEMESTER_RESTRICTED"], 403);
    }
  }

  const classFilter = { is_deleted: false };
  if (semester_id) classFilter.semester_id = semester_id;

  let classes = await Class.find(classFilter).populate({ path: "course_id", populate: "department_id" });
  if (req.userRole === "HEAD" && req.userFaculty) {
    classes = classes.filter((c) => c.course_id?.department_id?.description === req.userFaculty);
  }

  let assignedCount = 0;
  let skippedCount = 0;
  const results = [];

  for (const cls of classes) {
    if (cls.semester_id && !semester_id) {
      const sem = await Semester.findById(cls.semester_id);
      if (sem && sem.status === "COMPLETED") {
        skippedCount++;
        results.push({ class_code: cls.code, status: "FAILED", reason: "Học kỳ đang ở trạng thái Đã kết thúc" });
        continue;
      }
    }

    // Kiểm tra xem lớp đã được phân công hoặc đang có đề xuất chờ duyệt chưa
    const existing = await Assignment.findOne({
      class_id: cls._id,
      status: { $in: ["APPROVED", "PENDING"] },
      is_deleted: false,
    });
    if (existing) {
      skippedCount++;
      continue;
    }

    // Chạy thuật toán tối ưu lọc danh sách ứng viên đủ điều kiện
    const suggestions = await getSuggestedLecturers(cls._id);
    if (!suggestions || suggestions.length === 0) {
      results.push({ class_code: cls.code, status: "FAILED", reason: "Không có giảng viên đủ điều kiện/lịch rảnh" });
      skippedCount++;
      continue;
    }

    // Chọn ứng viên tối ưu số 1 (đứng đầu danh sách sau khi đã sắp xếp cân bằng tải)
    const bestCandidate = suggestions[0];
    await proposeAssignment({
      class_id: cls._id,
      lecturer_id: bestCandidate.lecturer_id,
      note: `Phân công tự động tối ưu (Khối lượng hiện tại: ${bestCandidate.current_hours}h${bestCandidate.preferences !== "Không có" ? `, Nguyện vọng: ${bestCandidate.preferences}` : ""})`,
      user: req.user,
    });
    assignedCount++;
    results.push({ class_code: cls.code, lecturer_code: bestCandidate.code, lecturer_name: bestCandidate.name, status: "SUCCESS" });
  }

  return successResponse(
    res,
    { assignedCount, skippedCount, details: results },
    `Phân công tự động hoàn tất: Đã sinh đề xuất cho ${assignedCount} lớp, bỏ qua ${skippedCount} lớp.`
  );
});
