import Assignment from "../models/Assignment.js";
import Class from "../models/Class.js";
import Room from "../models/Room.js";
import Schedule from "../models/Schedule.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
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

const schedulePayload = (body, classId) => ({
  class_id: classId,
  day_of_week: body.day_of_week,
  start_period: body.start_period,
  end_period: body.end_period,
  room_id: body.room_id,
  session_type: normalizeSessionType(body.session_type),
  group_code: body.group_code?.trim() || null,
});

const classLocked = (classId) =>
  Assignment.exists({ class_id: classId, status: "APPROVED", is_deleted: false });

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

  const classDoc = await Class.findOne({ _id: classId, is_deleted: false });
  const room = await Room.findOne({ _id: room_id, is_deleted: false });
  if (!classDoc) errors.push("CLASS_NOT_FOUND");
  if (!room) errors.push("ROOM_NOT_FOUND");
  if (classDoc && room && Number(classDoc.max_students || 0) > Number(room.capacity || 0)) {
    errors.push({ rule: "ROOM_CAPACITY_INVALID", message: "Phòng học không đủ sức chứa" });
  }
  if (await classLocked(classId)) errors.push("ASSIGNMENT_LOCKED");
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, errors.includes("ASSIGNMENT_LOCKED") ? 409 : 400);

  const schedule = await Schedule.create(
    schedulePayload({ ...req.body, day_of_week, start_period, end_period, room_id }, classId),
  );
  return successResponse(res, schedule, "Tạo lịch học thành công", 201);
});

export const updateSchedule = asyncHandler(async (req, res) => {
  const existing = await Schedule.findOne({ _id: req.params.id, is_deleted: false });
  if (!existing) return errorResponse(res, "Lịch dạy không tồn tại", ["SCHEDULE_NOT_FOUND"], 404);
  if (await classLocked(existing.class_id)) {
    return errorResponse(res, "Không thể sửa lịch lớp đã có phân công được duyệt", ["ASSIGNMENT_LOCKED"], 409);
  }
  const errors = validateSchedule({ ...existing.toObject(), ...req.body });
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);

  const nextPayload = schedulePayload({ ...existing.toObject(), ...req.body }, existing.class_id);
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, nextPayload, { new: true });
  return successResponse(res, schedule);
});

export const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findOne({ _id: req.params.id, is_deleted: false });
  if (!schedule) return errorResponse(res, "Lịch dạy không tồn tại", ["SCHEDULE_NOT_FOUND"], 404);
  if (await classLocked(schedule.class_id)) {
    return errorResponse(res, "Không thể xóa lịch lớp đã có phân công được duyệt", ["ASSIGNMENT_LOCKED"], 409);
  }
  schedule.is_deleted = true;
  await schedule.save();
  return successResponse(res, schedule, "Lịch dạy đã được xóa");
});
