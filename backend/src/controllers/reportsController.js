import Assignment from "../models/Assignment.js";
import Lecturer from "../models/Lecturer.js";
import Class from "../models/Class.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { normalizeCode } from "../utils/constants.js";
import { getCurrentHours } from "../services/conflictService.js";

export const lecturerWorkloads = asyncHandler(async (req, res) => {
  const { semester_id, department_id } = req.query;
  if (!semester_id) return errorResponse(res, "Dữ liệu không hợp lệ", ["SEMESTER_REQUIRED"], 400);
  const filter = { is_deleted: false };
  if (department_id) filter.department_id = department_id;
  const lecturers = await Lecturer.find(filter).populate("department_id");
  const data = [];
  for (const lecturer of lecturers) {
    const totalHours = await getCurrentHours(lecturer._id, semester_id, null, true);
    const maxHours = Number(lecturer.max_hours || 0);
    let status = "Đủ tải";
    if (totalHours < maxHours) status = "Thiếu giờ";
    else if (totalHours > maxHours) status = "Vượt tải";

    data.push({
      lecturer_id: lecturer._id,
      code: lecturer.code,
      name: lecturer.name,
      department: lecturer.department_id?.name || null,
      total_hours: totalHours,
      max_hours: maxHours,
      remaining_hours: maxHours - totalHours,
      status: status,
    });
  }
  return successResponse(res, data);
});

export const assignmentReport = asyncHandler(async (req, res) => {
  const { semester_id, status, department_id } = req.query;
  if (!semester_id) return errorResponse(res, "Dữ liệu không hợp lệ", ["SEMESTER_REQUIRED"], 400);
  const filter = { is_deleted: false };
  if (status) filter.status = normalizeCode(status);
  const assignments = await Assignment.find(filter)
    .populate({
      path: "class_id",
      populate: [{ path: "course_id", populate: "department_id" }, { path: "semester_id" }],
    })
    .populate({ path: "lecturer_id", populate: "department_id" })
    .sort({ createdAt: "desc" });
  let data = assignments.filter(
    (item) => String(item.class_id?.semester_id?._id || item.class_id?.semester_id) === String(semester_id),
  );
  if (department_id) {
    data = data.filter(
      (item) =>
        String(item.lecturer_id?.department_id?._id || item.lecturer_id?.department_id) ===
          String(department_id) ||
        String(item.class_id?.course_id?.department_id?._id || item.class_id?.course_id?.department_id) ===
          String(department_id),
    );
  }
  return successResponse(res, data);
});

export const exportAssignments = asyncHandler(async (req, res) => {
  const { semester_id, format = "excel" } = req.query;
  if (!semester_id) return errorResponse(res, "Dữ liệu không hợp lệ", ["SEMESTER_REQUIRED"], 400);
  const extension = format === "pdf" ? "pdf" : "xlsx";
  return successResponse(res, {
    download_url: `/downloads/reports/assignments-${semester_id}.${extension}`,
  }, "Tạo file báo cáo thành công");
});

// CHÈN VÀO ĐÂY: API thống kê 4 thẻ Cards tổng quan và Xuất Excel khối lượng giảng dạy
export const assignmentSummary = asyncHandler(async (req, res) => {
  const { semester_id, department_id } = req.query;
  if (!semester_id) return errorResponse(res, "Dữ liệu không hợp lệ", ["SEMESTER_REQUIRED"], 400);

  const classFilter = { is_deleted: false, semester_id };
  let classes = await Class.find(classFilter).populate("course_id");
  if (department_id) {
    classes = classes.filter(cls => String(cls.course_id?.department_id) === String(department_id));
  }

  const totalClasses = classes.length;
  const classIds = classes.map(cls => cls._id);

  const assignments = await Assignment.find({
    class_id: { $in: classIds },
    is_deleted: false,
  });

  let approvedCount = 0;
  let pendingCount = 0;

  for (const assign of assignments) {
    if (assign.status === "APPROVED") {
      approvedCount++;
    } else if (assign.status === "PENDING" || assign.status === "PROPOSED") {
      pendingCount++;
    }
  }

  const openCount = Math.max(0, totalClasses - approvedCount - pendingCount);

  return successResponse(res, {
    total: totalClasses,
    approved: approvedCount,
    pending: pendingCount,
    open: openCount,
  });
});

export const exportWorkloads = asyncHandler(async (req, res) => {
  const { semester_id, format = "excel" } = req.query;
  if (!semester_id) return errorResponse(res, "Dữ liệu không hợp lệ", ["SEMESTER_REQUIRED"], 400);
  const extension = format === "pdf" ? "pdf" : "xlsx";
  return successResponse(res, {
    download_url: `/downloads/reports/workloads-${semester_id}.${extension}`,
  }, "Tạo file báo cáo thành công");
});
