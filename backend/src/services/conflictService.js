import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import Class from "../models/Class.js";
import Course from "../models/Course.js";
import Lecturer from "../models/Lecturer.js";
import LecturerAvailability from "../models/LecturerAvailability.js";
import Room from "../models/Room.js";
import Schedule from "../models/Schedule.js";
import { rangesOverlap } from "../utils/time.js";

export { rangesOverlap };

const activeFilter = { is_deleted: false };

export const getClassSchedules = (classId) =>
  Schedule.find({ class_id: classId, ...activeFilter }).populate("room_id");

export const calculateClassHours = (schedules = []) =>
  schedules.reduce(
    (total, item) => total + (Number(item.end_period) - Number(item.start_period) + 1) * 15,
    0,
  );

export const getApprovedAssignments = (extraFilter = {}, onlyApproved = false) =>
  Assignment.find({
    status: onlyApproved ? "APPROVED" : { $in: ["APPROVED", "PENDING", "PROPOSED"] },
    is_deleted: false,
    ...extraFilter,
  })
    .populate({
      path: "class_id",
      populate: [{ path: "course_id" }, { path: "semester_id" }],
    })
    .populate({ path: "lecturer_id", populate: "department_id" });

export const getCurrentHours = async (lecturerId, semesterId, excludeAssignmentId, onlyApproved = false) => {
  const assignments = await getApprovedAssignments({ lecturer_id: lecturerId }, onlyApproved);
  let total = 0;

  for (const assignment of assignments) {
    if (
      excludeAssignmentId &&
      String(assignment._id) === String(excludeAssignmentId)
    ) {
      continue;
    }
    if (
      semesterId &&
      String(assignment.class_id?.semester_id?._id || assignment.class_id?.semester_id) !==
        String(semesterId)
    ) {
      continue;
    }
    const course = assignment.class_id?.course_id;
    const courseHours = course?.credits ? Number(course.credits) * 15 : calculateClassHours(await getClassSchedules(assignment.class_id?._id));
    total += courseHours;
  }

  return total;
};

export const checkLecturerScheduleConflict = async (
  lecturerId,
  classSchedules,
  excludeAssignmentId,
) => {
  const assignments = await getApprovedAssignments({ lecturer_id: lecturerId });
  const conflicts = [];

  for (const assignment of assignments) {
    if (
      excludeAssignmentId &&
      String(assignment._id) === String(excludeAssignmentId)
    ) {
      continue;
    }
    const existingSchedules = await getClassSchedules(assignment.class_id?._id);
    for (const incoming of classSchedules) {
      for (const existing of existingSchedules) {
        if (
          Number(incoming.day_of_week) === Number(existing.day_of_week) &&
          rangesOverlap(
            incoming.start_period,
            incoming.end_period,
            existing.start_period,
            existing.end_period,
          )
        ) {
          conflicts.push({
            rule: "SCHEDULE_CONFLICT",
            message: "Giảng viên bị trùng lịch dạy với lớp khác",
            meta: { assignment_id: assignment._id, class_id: assignment.class_id?._id },
          });
        }
      }
    }
  }

  return conflicts;
};

export const checkLecturerBusy = async (lecturerId, classSchedules) => {
  const availabilityItems = await LecturerAvailability.find({
    lecturer_id: lecturerId,
    is_deleted: false,
  });
  const busyItems = availabilityItems.filter((item) => item.status === "BUSY");
  const conflicts = [];

  for (const incoming of classSchedules) {
    for (const busy of busyItems) {
      if (
        Number(incoming.day_of_week) === Number(busy.day_of_week) &&
        rangesOverlap(
          incoming.start_period,
          incoming.end_period,
          busy.start_period,
          busy.end_period,
        )
      ) {
        conflicts.push({
          rule: "LECTURER_BUSY",
          message: "Giảng viên đã khai báo bận vào thời gian này",
          meta: { availability_id: busy._id },
        });
      }
    }
  }

  return conflicts;
};

export const checkMaxHours = async (
  lecturer,
  classDoc,
  classSchedules,
  excludeAssignmentId,
) => {
  const maxHours = Number(lecturer.max_hours || 0);
  if (!maxHours) return [];

  const currentHours = await getCurrentHours(
    lecturer._id,
    classDoc.semester_id,
    excludeAssignmentId,
  );
  const course = classDoc.course_id;
  const newClassHours = course?.credits ? Number(course.credits) * 15 : calculateClassHours(classSchedules);

  if (currentHours + newClassHours > maxHours) {
    return [
      {
        rule: "MAX_HOURS_EXCEEDED",
        message: "Giảng viên vượt định mức giờ dạy",
        meta: { current_hours: currentHours, new_class_hours: newClassHours, max_hours: maxHours },
      },
    ];
  }
  return [];
};

export const checkRoomCapacity = async (classDoc, classSchedules) => {
  const violations = [];
  for (const schedule of classSchedules) {
    const room = schedule.room_id?._id
      ? schedule.room_id
      : await Room.findOne({ _id: schedule.room_id, is_deleted: false });
    if (room && Number(classDoc.max_students || 0) > Number(room.capacity || 0)) {
      violations.push({
        rule: "ROOM_CAPACITY_INVALID",
        message: "Phòng học không đủ sức chứa",
        meta: { room_id: room._id, capacity: room.capacity },
      });
    }
  }
  return violations;
};

export const checkRoomConflict = async (classSchedules, excludeClassId) => {
  const approvedAssignments = await getApprovedAssignments();
  const conflicts = [];

  for (const assignment of approvedAssignments) {
    if (String(assignment.class_id?._id) === String(excludeClassId)) continue;
    const existingSchedules = await getClassSchedules(assignment.class_id?._id);
    for (const incoming of classSchedules) {
      for (const existing of existingSchedules) {
        if (
          String(incoming.room_id?._id || incoming.room_id) ===
            String(existing.room_id?._id || existing.room_id) &&
          Number(incoming.day_of_week) === Number(existing.day_of_week) &&
          rangesOverlap(
            incoming.start_period,
            incoming.end_period,
            existing.start_period,
            existing.end_period,
          )
        ) {
          conflicts.push({
            rule: "ROOM_CONFLICT",
            message: "Phòng học bị trùng lịch",
            meta: { room_id: incoming.room_id?._id || incoming.room_id },
          });
        }
      }
    }
  }

  return conflicts;
};

export const checkAssignmentEligibility = async ({
  classId,
  lecturerId,
  excludeAssignmentId,
  requireClassOpen = true,
}) => {
  if (!mongoose.isValidObjectId(classId)) {
    return { is_valid: false, classDoc: null, lecturer: null, violations: [{ rule: "CLASS_NOT_FOUND", message: "Lớp tín chỉ không tồn tại" }] };
  }
  if (!mongoose.isValidObjectId(lecturerId)) {
    return { is_valid: false, classDoc: null, lecturer: null, violations: [{ rule: "LECTURER_NOT_FOUND", message: "Giảng viên không tồn tại" }] };
  }

  const classDoc = await Class.findOne({ _id: classId, is_deleted: false })
    .populate({ path: "course_id", populate: "department_id" })
    .populate("semester_id");
  const lecturer = await Lecturer.findOne({ _id: lecturerId, is_deleted: false }).populate(
    "department_id",
  );
  const violations = [];

  if (!classDoc) violations.push({ rule: "CLASS_NOT_FOUND", message: "Lớp tín chỉ không tồn tại" });
  if (!lecturer) violations.push({ rule: "LECTURER_NOT_FOUND", message: "Giảng viên không tồn tại" });
  if (violations.length) return { is_valid: false, classDoc, lecturer, violations };

  if (requireClassOpen && classDoc.status !== "OPEN") {
    violations.push({ rule: "INVALID_STATUS_TRANSITION", message: "Lớp tín chỉ không ở trạng thái OPEN" });
  }
  const existingApproved = await Assignment.findOne({
    class_id: classDoc._id,
    status: { $in: ["APPROVED", "PENDING", "PROPOSED"] },
    is_deleted: false,
    ...(excludeAssignmentId ? { _id: { $ne: excludeAssignmentId } } : {}),
  });
  if (existingApproved) {
    violations.push({
      rule: "CLASS_ALREADY_ASSIGNED",
      message: "Lớp đã được phân công cho giảng viên khác",
      meta: { assignment_id: existingApproved._id },
    });
  }
  if (lecturer.status !== "ACTIVE") {
    violations.push({ rule: "INVALID_STATUS_TRANSITION", message: "Giảng viên không ở trạng thái ACTIVE" });
  }

  const classSchedules = await getClassSchedules(classDoc._id);
  // Không bắt buộc phải có lịch học ngay mới được gán/đề xuất giảng viên (hệ thống tự tính giờ theo tín chỉ môn học)

  violations.push(
    ...(await checkLecturerScheduleConflict(lecturer._id, classSchedules, excludeAssignmentId)),
    ...(await checkLecturerBusy(lecturer._id, classSchedules)),
    ...(await checkMaxHours(lecturer, classDoc, classSchedules, excludeAssignmentId)),
    ...(await checkRoomCapacity(classDoc, classSchedules)),
    ...(await checkRoomConflict(classSchedules, classDoc._id)),
  );

  return {
    is_valid: violations.length === 0,
    classDoc,
    lecturer,
    classSchedules,
    violations,
  };
};

export const getSuggestedLecturers = async (classId) => {
  const classDoc = await Class.findOne({ _id: classId, is_deleted: false }).populate("course_id");
  if (!classDoc) return null;
  const existingAssignment = await Assignment.findOne({
    class_id: classDoc._id,
    status: { $in: ["APPROVED", "PENDING", "PROPOSED"] },
    is_deleted: false,
  });

  const filter = { status: "ACTIVE", is_deleted: false };
  if (classDoc.course_id?.department_id) {
    filter.department_id = classDoc.course_id.department_id;
  }

  const lecturers = await Lecturer.find(filter).populate("department_id");
  const suggestions = [];

  for (const lecturer of lecturers) {
    const eligibility = await checkAssignmentEligibility({
      classId,
      lecturerId: lecturer._id,
      excludeAssignmentId: existingAssignment?._id,
      requireClassOpen: !existingAssignment,
    });
    const currentHours = await getCurrentHours(lecturer._id, classDoc.semester_id);
    if (!eligibility.is_valid) continue;

    const totalHours = currentHours + (lecturer.taught_hours || 0);
    const reasons = ["Đúng bộ môn", "Không trùng lịch", "Không vượt định mức giờ dạy"];
    if (lecturer.preferences) {
      reasons.push(`Nguyện vọng: ${lecturer.preferences}`);
    }

    suggestions.push({
      lecturer_id: lecturer._id,
      code: lecturer.code,
      name: lecturer.name,
      degree: lecturer.degree,
      department: lecturer.department_id?.name || null,
      current_hours: totalHours,
      max_hours: lecturer.max_hours,
      available_hours: Number(lecturer.max_hours || 0) - totalHours,
      preferences: lecturer.preferences || "Không có",
      is_valid: true,
      reasons,
      violations: eligibility.violations,
    });
  }

  // Thuật toán tối ưu: Cân bằng khối lượng giảng dạy bằng cách ưu tiên giảng viên có số giờ dạy ít nhất lên đầu
  return suggestions.sort((a, b) => a.current_hours - b.current_hours);
};
