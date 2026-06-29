import Assignment from "../models/Assignment.js";
import Class from "../models/Class.js";
import Course from "../models/Course.js";
import Schedule from "../models/Schedule.js";
import Semester from "../models/Semester.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { CLASS_STATUSES, normalizeCode } from "../utils/constants.js";
import { getSuggestedLecturers } from "../services/conflictService.js";

export const getAllClasses = asyncHandler(async (req, res) => {
  await Class.updateMany({ status: "CANCELLED", is_deleted: false }, { is_deleted: true });
  const filter = { is_deleted: false };
  if (req.query.semester_id) filter.semester_id = req.query.semester_id;
  if (req.query.course_id) filter.course_id = req.query.course_id;
  if (req.query.status) filter.status = normalizeCode(req.query.status);
  if (req.query.keyword) filter.code = { $regex: req.query.keyword, $options: "i" };
  const classes = await Class.find(filter)
    .populate("course_id semester_id")
    .sort({ createdAt: "desc" })
    .lean();

  const classIds = classes.map((c) => c._id);
  const [assignments, schedules] = await Promise.all([
    Assignment.find({ class_id: { $in: classIds }, is_deleted: false }).populate("lecturer_id").lean(),
    Schedule.find({ class_id: { $in: classIds }, is_deleted: false }).lean(),
  ]);

  // Map lưu trữ phân công giảng viên theo ID lớp (chuyển sang string để match chính xác)
  const assignmentMap = {};
  for (const a of assignments) {
    const classKey = String(a.class_id?._id || a.class_id || "");
    if (a.status === "APPROVED" || !assignmentMap[classKey]) {
      assignmentMap[classKey] = a;
    }
  }

  // Map đếm số lượng lịch học thực tế của từng lớp
  const scheduleCountMap = {};
  for (const s of schedules) {
    const classKey = String(s.class_id?._id || s.class_id || "");
    scheduleCountMap[classKey] = (scheduleCountMap[classKey] || 0) + 1;
  }

  // Gộp thông tin phân công và số lượng lịch học vào danh sách lớp trả về cho frontend
  const result = classes.map((c) => {
    const classKey = String(c._id);
    const a = assignmentMap[classKey];
    return {
      ...c,
      assigned_lecturer: a?.lecturer_id ? `${a.lecturer_id.code || ""} - ${a.lecturer_id.name}` : null,
      assignment_status: a ? a.status : "UNASSIGNED",
      assignment_id: a ? a._id : null,
      schedule_count: scheduleCountMap[classKey] || 0,
    };
  });

  return successResponse(res, result);
});

export const createClass = asyncHandler(async (req, res) => {
  const { code, course_id, semester_id, max_students } = req.body;
  const errors = [];
  if (!code) errors.push("CODE_REQUIRED");
  if (await Class.exists({ code, is_deleted: false })) errors.push("CLASS_CODE_EXISTS");
  if (!(await Course.exists({ _id: course_id, is_deleted: false }))) errors.push("COURSE_NOT_FOUND");

  const semester = await Semester.findOne({ _id: semester_id, is_deleted: false });
  if (!semester) {
    errors.push("SEMESTER_NOT_FOUND");
  } else if (!["PLANNING", "UPCOMING"].includes(semester.status)) {
    const statusLabels = { ACTIVE: "Đang diễn ra", COMPLETED: "Đã kết thúc", LOCKED: "Đã khóa" };
    return errorResponse(res, `Không thể tạo lớp tín chỉ cho học kỳ "${semester.name}" đang ở trạng thái "${statusLabels[semester.status] || semester.status}". Chỉ cho phép tạo lớp khi học kỳ đang ở trạng thái "Đang lập kế hoạch" hoặc "Chưa mở".`, ["SEMESTER_STATUS_RESTRICTED"], 403);
  }

  if (max_students !== undefined && max_students !== null && (isNaN(max_students) || Number(max_students) < 25)) {
    errors.push("MAX_STUDENTS_MIN_25");
  }
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);

  const classDoc = await Class.create({
    code,
    course_id,
    semester_id,
    max_students: Number(max_students || 80),
    status: "OPEN",
  });
  return successResponse(res, classDoc, "Tạo lớp tín chỉ thành công", 201);
});

export const updateClass = asyncHandler(async (req, res) => {
  const existingClass = await Class.findOne({ _id: req.params.id, is_deleted: false });
  if (!existingClass) return errorResponse(res, "Lớp học không tồn tại", ["CLASS_NOT_FOUND"], 404);

  const hasApproved = await Assignment.exists({ class_id: req.params.id, status: "APPROVED", is_deleted: false });
  if (hasApproved || ["ASSIGNED", "ACTIVE", "COMPLETED", "CANCELLED"].includes(existingClass.status)) {
    return errorResponse(res, `Không thể chỉnh sửa do lớp đang ở trạng thái ${existingClass.status}. Vui lòng kiểm tra lại.`, ["CLASS_LOCKED"], 403);
  }

  const { max_students } = req.body;
  if (max_students !== undefined && max_students !== null && (isNaN(max_students) || Number(max_students) < 25)) {
    return errorResponse(res, "Dữ liệu không hợp lệ", ["MAX_STUDENTS_MIN_25"], 400);
  }

  // Kiểm tra sức chứa các phòng học hiện tại nếu Admin thay đổi sĩ số tối đa
  if (max_students !== undefined && max_students !== null) {
    const newMax = Number(max_students);
    const schedules = await Schedule.find({ class_id: req.params.id, is_deleted: false }).populate("room_id");
    for (const s of schedules) {
      if (s.room_id && Number(s.room_id.capacity || 0) < newMax) {
        return errorResponse(res, `Phòng học ${s.room_id.name} chỉ chứa tối đa ${s.room_id.capacity} SV, không đủ cho sĩ số mới (${newMax} SV)`, ["ROOM_CAPACITY_EXCEEDED"], 400);
      }
    }
  }

  const updates = {};
  for (const key of ["code", "course_id", "semester_id", "max_students"]) {
    if (req.body[key] !== undefined) updates[key] = key === "max_students" ? Number(req.body[key]) : req.body[key];
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
  const targetClass = await Class.findOne({ _id: req.params.id, is_deleted: false });
  if (!targetClass) return errorResponse(res, "Lớp học không tồn tại", ["CLASS_NOT_FOUND"], 404);

  const semester = await Semester.findById(targetClass.semester_id);
  if (semester && new Date() >= new Date(semester.start_date)) {
    return errorResponse(res, "Không thể xóa lớp thuộc học kỳ đang diễn ra hoặc đã kết thúc để đảm bảo an toàn dữ liệu.", ["SEMESTER_ACTIVE_OR_ENDED"], 403);
  }

  const hasApproved = await Assignment.exists({ class_id: req.params.id, status: "APPROVED", is_deleted: false });
  if (hasApproved) {
    return errorResponse(res, "Không thể xóa lớp đã được duyệt phân công giảng viên. Vui lòng thu hồi phân công trước.", ["ASSIGNMENT_LOCKED"], 403);
  }

  targetClass.is_deleted = true;
  targetClass.status = "CANCELLED";
  await targetClass.save();

  await Schedule.updateMany({ class_id: req.params.id }, { is_deleted: true });
  return successResponse(res, targetClass, "Xóa lớp tín chỉ thành công");
});
