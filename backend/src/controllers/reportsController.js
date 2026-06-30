import Assignment from "../models/Assignment.js";
import Lecturer from "../models/Lecturer.js";
import Class from "../models/Class.js";
import Semester from "../models/Semester.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { normalizeCode } from "../utils/constants.js";
import { getCurrentHours } from "../services/conflictService.js";

export const lecturerWorkloads = asyncHandler(async (req, res) => {
  const { semester_id, department_id } = req.query;
  const isAllSem = !semester_id || semester_id === "all";
  const semDoc = !isAllSem ? await Semester.findById(semester_id).catch(() => null) : null;
  const semName = semDoc ? semDoc.name : "Tất cả học kỳ";

  const filter = { is_deleted: false };
  if (department_id) filter.department_id = department_id;
  if (req.userRole === "HEAD" && req.userFaculty) {
    filter.faculty = req.userFaculty;
  }
  const allLecturers = await Lecturer.find(filter)
    .populate("department_id")
    .populate({ path: "user_id", populate: { path: "role_id" } });

  const validLecturers = allLecturers.filter((item) => {
    const roleCode = item.user_id?.role_id?.code || item.user_id?.role;
    if (roleCode === "HEAD" || roleCode === "ADMIN") return false;
    const codeStr = (item.code || "").toUpperCase();
    const nameStr = (item.name || "").toUpperCase();
    if (codeStr.includes("TRUONGKHOA") || codeStr.includes("ADMIN")) return false;
    if (nameStr.includes("TRƯỞNG KHOA") || nameStr === "ADMIN") return false;
    return true;
  });

  const data = [];
  for (const lecturer of validLecturers) {
    const totalHours = await getCurrentHours(lecturer._id, isAllSem ? null : semester_id, null, true);
    const maxHours = Number(lecturer.max_hours || 180);
    let status = "Đủ giờ";
    if (totalHours < 45) status = "Thiếu giờ";
    else if (totalHours > maxHours) status = "Vượt tải";

    data.push({
      lecturer_id: lecturer._id,
      code: lecturer.code,
      name: lecturer.name,
      department: lecturer.department_id?.name || null,
      faculty: lecturer.faculty || "Khoa Công nghệ thông tin",
      semester_name: semName,
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
  const isAllSem = !semester_id || semester_id === "all";
  const filter = { is_deleted: false };
  if (status) filter.status = normalizeCode(status);
  const assignments = await Assignment.find(filter)
    .populate({
      path: "class_id",
      populate: [{ path: "course_id", populate: "department_id" }, { path: "semester_id" }],
    })
    .populate({ path: "lecturer_id", populate: "department_id" })
    .sort({ createdAt: "desc" });
  let data = isAllSem ? assignments : assignments.filter(
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
  if (req.userRole === "HEAD" && req.userFaculty) {
    data = data.filter((item) => {
      const classFac = item.class_id?.course_id?.department_id?.description;
      const lecFac = item.lecturer_id?.faculty || item.lecturer_id?.department_id?.description;
      return classFac === req.userFaculty || lecFac === req.userFaculty;
    });
  }
  return successResponse(res, data);
});

export const exportAssignments = asyncHandler(async (req, res) => {
  const { semester_id = "all", format = "excel" } = req.query;
  const extension = format === "pdf" ? "pdf" : "xlsx";
  return successResponse(res, {
    download_url: `/downloads/reports/assignments-${semester_id}.${extension}`,
  }, "Tạo file báo cáo thành công");
});

// CHÈN VÀO ĐÂY: API thống kê 4 thẻ Cards tổng quan và Xuất Excel khối lượng giảng dạy
export const assignmentSummary = asyncHandler(async (req, res) => {
  const { semester_id, department_id } = req.query;
  const isAllSem = !semester_id || semester_id === "all";

  const classFilter = { is_deleted: false };
  if (!isAllSem) classFilter.semester_id = semester_id;
  let classes = await Class.find(classFilter).populate({ path: "course_id", populate: "department_id" });
  if (department_id) {
    classes = classes.filter(cls => String(cls.course_id?.department_id?._id || cls.course_id?.department_id) === String(department_id));
  }
  if (req.userRole === "HEAD" && req.userFaculty) {
    classes = classes.filter(cls => cls.course_id?.department_id?.description === req.userFaculty);
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
  const { semester_id = "all", format = "excel" } = req.query;
  const extension = format === "pdf" ? "pdf" : "xlsx";
  return successResponse(res, {
    download_url: `/downloads/reports/workloads-${semester_id}.${extension}`,
  }, "Tạo file báo cáo thành công");
});
