import Assignment from "../models/Assignment.js";
import AssignmentHistory from "../models/AssignmentHistory.js";
import Class from "../models/Class.js";
import { ApiError } from "../utils/apiResponse.js";
import { checkAssignmentEligibility } from "./conflictService.js";

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
  status = "PENDING",
  note,
  user,
}) => {
  const normalizedStatus = String(status || "PENDING").toUpperCase();
  if (normalizedStatus === "APPROVED") {
    await assertEligible({ classId: class_id, lecturerId: lecturer_id });
  }

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

export const approveAssignment = async ({ id, note }) => {
  const assignment = await findAssignment(id);
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

export const changeLecturer = async ({ id, new_lecturer_id, note }) => {
  const assignment = await findAssignment(id);
  const oldLecturerId = assignment.lecturer_id;

  await assertEligible({
    classId: assignment.class_id,
    lecturerId: new_lecturer_id,
    excludeAssignmentId: assignment._id,
    requireClassOpen: statusOf(assignment.status) !== "APPROVED",
  });

  assignment.lecturer_id = new_lecturer_id;
  assignment.note = note || assignment.note;
  await assignment.save();

  await AssignmentHistory.create({
    assignment_id: assignment._id,
    old_lecturer_id: oldLecturerId,
    new_lecturer_id,
    changed_at: new Date(),
  });

  return assignment;
};

export const softDeleteAssignment = async (id) => {
  const assignment = await findAssignment(id);
  assignment.is_deleted = true;
  await assignment.save();

  if (statusOf(assignment.status) === "APPROVED") {
    const classDoc = await Class.findById(assignment.class_id);
    if (classDoc && classDoc.status !== "ACTIVE") {
      classDoc.status = "OPEN";
      await classDoc.save();
    }
  }

  return assignment;
};
