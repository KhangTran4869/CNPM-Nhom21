import Assignment from "../models/Assignment.js";
import Class from "../models/Class.js";
import Room from "../models/Room.js";
import Schedule from "../models/Schedule.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { rangesOverlap } from "../utils/time.js";
import mongoose from "mongoose";

const SESSION_TYPES = ["THEORY", "PRACTICE"];

const normalizeSessionType = (value) => String(value || "THEORY").trim().toUpperCase();

const validateSchedule = ({ day_of_week, start_period, end_period, session_type }) => {
  const errors = [];
  const normalizedSessionType = normalizeSessionType(session_type);
  if (Number(day_of_week) < 2 || Number(day_of_week) > 8) errors.push("DAY_OF_WEEK_INVALID");
  if (Number(start_period) <= 0) errors.push("START_PERIOD_INVALID");
  if (Number(end_period) < Number(start_period)) errors.push("END_PERIOD_INVALID");
  if (!SESSION_TYPES.includes(normalizedSessionType)) errors.push("SESSION_TYPE_INVALID");
  return errors;
};

const hasApprovedAssignment = async (classId) => {
  const classDoc = await Class.findOne({ _id: classId, is_deleted: false });
  if (classDoc && ["CANCELLED", "ACTIVE", "COMPLETED", "ASSIGNED"].includes(classDoc.status)) {
    return true;
  }
  return await Assignment.exists({ class_id: classId, status: "APPROVED", is_deleted: false });
};

const checkRoomScheduleConflict = async (classId, roomId, dayOfWeek, startPeriod, endPeriod, excludeScheduleId = null) => {
  const targetClass = await Class.findOne({ _id: classId, is_deleted: false });
  if (!targetClass || !targetClass.semester_id) return null;

  const semesterClasses = await Class.find({ semester_id: targetClass.semester_id, is_deleted: false }).select("_id code");
  const classIds = semesterClasses.map((c) => c._id);
  const classCodeMap = new Map(semesterClasses.map((c) => [String(c._id), c.code]));

  const query = {
    class_id: { $in: classIds },
    room_id: roomId,
    day_of_week: Number(dayOfWeek),
    is_deleted: false,
  };
  if (excludeScheduleId) {
    query._id = { $ne: excludeScheduleId };
  }

  const existingSchedules = await Schedule.find(query).populate("room_id");
  for (const s of existingSchedules) {
    if (rangesOverlap(startPeriod, endPeriod, s.start_period, s.end_period)) {
      const conflictClassCode = classCodeMap.get(String(s.class_id)) || "khác";
      const roomName = s.room_id?.name || "phòng này";
      return `Phòng học ${roomName} đang bị trùng lịch! Đã có lớp "${conflictClassCode}" học vào Thứ ${dayOfWeek}, tiết ${s.start_period}-${s.end_period}.`;
    }
  }
  return null;
};

const schedulePayload = (body, classId) => ({
  class_id: classId,
  day_of_week: Number(body.day_of_week),
  start_period: Number(body.start_period),
  end_period: Number(body.end_period),
  room_id: body.room_id,
  session_type: normalizeSessionType(body.session_type),
  group_code: body.group_code?.trim() || null,
});

export const getAllSchedules = asyncHandler(async (req, res) => {
  const filter = { is_deleted: false };
  if (req.params.class_id) filter.class_id = req.params.class_id;
  const schedules = await Schedule.find(filter).populate("class_id room_id").sort({ createdAt: "desc" });
  return successResponse(res, schedules);
});

export const createSchedule = asyncHandler(async (req, res) => {
  const classId = req.params.class_id || req.body.class_id;
  const { day_of_week, start_period, end_period, room_id } = req.body;
  const errors = validateSchedule(req.body);

  if (!mongoose.isValidObjectId(classId)) errors.push("CLASS_ID_INVALID");
  if (!mongoose.isValidObjectId(room_id)) errors.push("ROOM_ID_INVALID");
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);

  if (await hasApprovedAssignment(classId)) {
    return errorResponse(res, "Lớp học đã được duyệt phân công giảng viên. Vui lòng thu hồi phân công trước khi thêm lịch.", ["ASSIGNMENT_LOCKED"], 403);
  }

  const classDoc = await Class.findOne({ _id: classId, is_deleted: false });
  const room = await Room.findOne({ _id: room_id, is_deleted: false });
  if (!classDoc) errors.push("CLASS_NOT_FOUND");
  if (!room) errors.push("ROOM_NOT_FOUND");
  if (classDoc && room && Number(classDoc.max_students || 0) > Number(room.capacity || 0)) {
    errors.push({ rule: "ROOM_CAPACITY_INVALID", message: `Phòng học ${room.name} (chứa ${room.capacity}) không đủ cho ${classDoc.max_students} SV` });
  }
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);

  const conflictMsg = await checkRoomScheduleConflict(classId, room_id, day_of_week, start_period, end_period);
  if (conflictMsg) {
    return errorResponse(res, conflictMsg, [{ rule: "ROOM_SCHEDULE_CONFLICT", message: conflictMsg }], 400);
  }

  const schedule = await Schedule.create(
    schedulePayload({ ...req.body, day_of_week, start_period, end_period, room_id }, classId),
  );
  return successResponse(res, schedule, "Tạo lịch học thành công", 201);
});

export const updateSchedule = asyncHandler(async (req, res) => {
  const existing = await Schedule.findOne({ _id: req.params.id, is_deleted: false });
  if (!existing) return errorResponse(res, "Lịch dạy không tồn tại", ["SCHEDULE_NOT_FOUND"], 404);

  if (await hasApprovedAssignment(existing.class_id)) {
    return errorResponse(res, "Lớp học đã được duyệt phân công giảng viên. Vui lòng thu hồi phân công trước khi sửa lịch.", ["ASSIGNMENT_LOCKED"], 403);
  }

  const errors = validateSchedule({ ...existing.toObject(), ...req.body });
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);

  const roomId = req.body.room_id || existing.room_id;
  const classDoc = await Class.findOne({ _id: existing.class_id, is_deleted: false });
  const room = await Room.findOne({ _id: roomId, is_deleted: false });
  if (classDoc && room && Number(classDoc.max_students || 0) > Number(room.capacity || 0)) {
    return errorResponse(res, `Phòng học ${room.name} (chứa ${room.capacity}) không đủ cho ${classDoc.max_students} SV`, ["ROOM_CAPACITY_INVALID"], 400);
  }

  const dayOfWeek = req.body.day_of_week ?? existing.day_of_week;
  const startPeriod = req.body.start_period ?? existing.start_period;
  const endPeriod = req.body.end_period ?? existing.end_period;
  const conflictMsg = await checkRoomScheduleConflict(existing.class_id, roomId, dayOfWeek, startPeriod, endPeriod, existing._id);
  if (conflictMsg) {
    return errorResponse(res, conflictMsg, [{ rule: "ROOM_SCHEDULE_CONFLICT", message: conflictMsg }], 400);
  }

  const nextPayload = schedulePayload({ ...existing.toObject(), ...req.body }, existing.class_id);
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, nextPayload, { new: true });
  return successResponse(res, schedule);
});

export const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findOne({ _id: req.params.id, is_deleted: false });
  if (!schedule) return errorResponse(res, "Lịch dạy không tồn tại", ["SCHEDULE_NOT_FOUND"], 404);

  if (await hasApprovedAssignment(schedule.class_id)) {
    return errorResponse(res, "Lớp học đã được duyệt phân công giảng viên. Vui lòng thu hồi phân công trước khi xóa lịch.", ["ASSIGNMENT_LOCKED"], 403);
  }

  schedule.is_deleted = true;
  await schedule.save();
  return successResponse(res, schedule, "Lịch dạy đã được xóa");
});
