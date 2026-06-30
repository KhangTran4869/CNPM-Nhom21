import Assignment from "../models/Assignment.js";
import AssignmentHistory from "../models/AssignmentHistory.js";
import Class from "../models/Class.js";
import Semester from "../models/Semester.js";
import { ApiError } from "../utils/apiResponse.js";
import { ASSIGNMENT_STATUSES } from "../utils/constants.js";
import { checkAssignmentEligibility } from "./conflictService.js";

const assertNotLocked = async (class_id) => {
  if (!class_id) return;
  const cls = await Class.findById(class_id);
  if (!cls || !cls.semester_id) return;
  const sem = await Semester.findById(cls.semester_id);
  if (sem && sem.status === "COMPLETED") {
    throw new ApiError(`Học kỳ "${sem.name}" đã kết thúc. Không cho phép sửa đổi phân công giảng dạy!`, 403, ["SEMESTER_COMPLETED"]);
  }
};

const findAssignment = async (id) => {
  const assignment = await Assignment.findOne({ _id: id, is_deleted: false });
  if (!assignment) {
    throw new ApiError("Không tìm thấy phân công", 404, ["ASSIGNMENT_NOT_FOUND"]);
  }
  return assignment;
};

const statusOf = (value) => String(value || "").toUpperCase();

const assertEligible = async (params) => {
  const eligibility = await checkAssignmentEligibility(params);
  if (!eligibility.is_valid) {
    throw new ApiError(
      "Xung đột nghiệp vụ",
      409,
      eligibility.violations,
    );
  }
  return eligibility;
};

export const proposeAssignment = async ({ class_id, lecturer_id, note, user }) => {
  await assertNotLocked(class_id);
  await assertEligible({ classId: class_id, lecturerId: lecturer_id });
  return Assignment.create({
    class_id,
    lecturer_id,
    status: "PENDING",
    assigned_by: user?._id,
    note,
  });
};

export const createAssignmentDirect = async ({
  class_id,
  lecturer_id,
  status = "APPROVED",
  note,
  user,
}) => {
  await assertNotLocked(class_id);
  const normalizedStatus = String(status || "APPROVED").toUpperCase();
  if (!ASSIGNMENT_STATUSES.includes(normalizedStatus)) {
    throw new ApiError("Trạng thái phân công không hợp lệ", 400, ["INVALID_STATUS"]);
  }
  await assertEligible({ classId: class_id, lecturerId: lecturer_id });

  const assignment = await Assignment.create({
    class_id,
    lecturer_id,
    status: normalizedStatus,
    assigned_by: user?._id,
    note,
  });

  if (normalizedStatus === "APPROVED") {
    await Class.findByIdAndUpdate(class_id, { status: "ASSIGNED" });
  }

  return assignment;
};

export const updateAssignmentRecord = async ({ id, lecturer_id, status, note, user, userRole }) => {
  const assignment = await findAssignment(id);
  await assertNotLocked(assignment.class_id);
  const updates = {};
  let nextStatus = status ? statusOf(status) : statusOf(assignment.status);

  if (status && !ASSIGNMENT_STATUSES.includes(nextStatus)) {
    throw new ApiError("Trạng thái phân công không hợp lệ", 400, ["INVALID_STATUS"]);
  }

  if (lecturer_id && String(lecturer_id) !== String(assignment.lecturer_id)) {
    if (!note || !note.trim()) {
      throw new ApiError("Vui lòng nhập lý do đổi giảng viên vào ô Ghi chú", 400, ["NOTE_REQUIRED"]);
    }
    const oldLecturerId = assignment.lecturer_id;
    await assertEligible({
      classId: assignment.class_id,
      lecturerId: lecturer_id,
      excludeAssignmentId: assignment._id,
      requireClassOpen: false,
    });
    updates.lecturer_id = lecturer_id;

    if (userRole === "HEAD") {
      nextStatus = "PENDING";
    }

    await AssignmentHistory.create({
      assignment_id: assignment._id,
      old_lecturer_id: oldLecturerId,
      new_lecturer_id: lecturer_id,
      changed_by: user?._id || null,
      changed_by_name: user?.name || user?.username || (userRole === "ADMIN" ? "Quản trị viên" : "Trưởng khoa"),
      reason: note.trim(),
      changed_at: new Date(),
    });
  } else if (nextStatus === "APPROVED") {
    await assertEligible({
      classId: assignment.class_id,
      lecturerId: assignment.lecturer_id,
      excludeAssignmentId: assignment._id,
      requireClassOpen: false,
    });
  }

  updates.status = nextStatus;
  if (note !== undefined) updates.note = note;

  Object.assign(assignment, updates);
  await assignment.save();

  if (statusOf(assignment.status) === "APPROVED") {
    await Class.findByIdAndUpdate(assignment.class_id, { status: "ASSIGNED" });
  } else {
    await Class.findByIdAndUpdate(assignment.class_id, { status: "OPEN" });
  }

  return assignment;
};

export const approveAssignment = async ({ id, note }) => {
  const assignment = await findAssignment(id);
  await assertNotLocked(assignment.class_id);
  if (statusOf(assignment.status) !== "PENDING") {
    throw new ApiError("Chỉ duyệt phân công đang chờ", 400, [
      "INVALID_STATUS_TRANSITION",
    ]);
  }

  await assertEligible({
    classId: assignment.class_id,
    lecturerId: assignment.lecturer_id,
    excludeAssignmentId: assignment._id,
  });

  assignment.status = "APPROVED";
  assignment.note = note || assignment.note;
  await assignment.save();
  await Class.findByIdAndUpdate(assignment.class_id, { status: "ASSIGNED" });
  return assignment;
};

export const rejectAssignment = async ({ id, note }) => {
  if (!note) {
    throw new ApiError("Ghi chú là bắt buộc", 400, ["NOTE_REQUIRED"]);
  }

  const assignment = await findAssignment(id);
  await assertNotLocked(assignment.class_id);
  if (statusOf(assignment.status) !== "PENDING") {
    throw new ApiError("Chỉ từ chối phân công đang chờ", 400, [
      "INVALID_STATUS_TRANSITION",
    ]);
  }

  assignment.status = "REJECTED";
  assignment.note = note;
  await assignment.save();
  return assignment;
};

export const changeLecturer = async ({ id, new_lecturer_id, note, user, userRole }) => {
  if (!note || !note.trim()) {
    throw new ApiError("Vui lòng nhập lý do đổi giảng viên vào ô Ghi chú", 400, ["NOTE_REQUIRED"]);
  }

  const assignment = await findAssignment(id);
  await assertNotLocked(assignment.class_id);
  const oldLecturerId = assignment.lecturer_id;

  await assertEligible({
    classId: assignment.class_id,
    lecturerId: new_lecturer_id,
    excludeAssignmentId: assignment._id,
    requireClassOpen: false,
  });

  assignment.lecturer_id = new_lecturer_id;
  assignment.note = note.trim();

  if (userRole === "HEAD") {
    assignment.status = "PENDING";
  }

  await assignment.save();

  if (statusOf(assignment.status) === "APPROVED") {
    await Class.findByIdAndUpdate(assignment.class_id, { status: "ASSIGNED" });
  } else {
    await Class.findByIdAndUpdate(assignment.class_id, { status: "OPEN" });
  }

  await AssignmentHistory.create({
    assignment_id: assignment._id,
    old_lecturer_id: oldLecturerId,
    new_lecturer_id,
    changed_by: user?._id || null,
    changed_by_name: user?.name || user?.username || (userRole === "ADMIN" ? "Quản trị viên" : "Trưởng khoa"),
    reason: note.trim(),
    changed_at: new Date(),
  });

  return assignment;
};

export const softDeleteAssignment = async (id) => {
  const assignment = await findAssignment(id);
  await assertNotLocked(assignment.class_id);
  const classDoc = await Class.findById(assignment.class_id);
  if (classDoc && (classDoc.status === "ACTIVE" || classDoc.status === "COMPLETED")) {
    const err = new Error("Không thể thu hồi phân công khi môn học đang diễn ra (ACTIVE) hoặc đã kết thúc (COMPLETED).");
    err.status = 403;
    err.code = "REVOKE_FORBIDDEN_ACTIVE_COMPLETED";
    throw err;
  }

  assignment.is_deleted = true;
  await assignment.save();

  if (statusOf(assignment.status) === "APPROVED") {
    if (classDoc && classDoc.status !== "ACTIVE") {
      classDoc.status = "OPEN";
      await classDoc.save();
    }
  }

  return assignment;
};
