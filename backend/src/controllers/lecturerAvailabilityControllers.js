import Lecturer from "../models/Lecturer.js";
import LecturerAvailability from "../models/LecturerAvailability.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { AVAILABILITY_STATUSES, normalizeCode } from "../utils/constants.js";
import { rangesOverlap } from "../services/conflictService.js";

const canAccessLecturer = (req, lecturerId) =>
  req.userRole !== "LECTURER" || String(req.lecturer?._id) === String(lecturerId);

const validate = ({ day_of_week, start_period, end_period, status }) => {
  const errors = [];
  if (Number(day_of_week) < 2 || Number(day_of_week) > 8) errors.push("DAY_OF_WEEK_INVALID");
  if (Number(start_period) <= 0) errors.push("START_PERIOD_INVALID");
  if (Number(end_period) < Number(start_period)) errors.push("END_PERIOD_INVALID");
  if (!AVAILABILITY_STATUSES.includes(normalizeCode(status))) errors.push("INVALID_STATUS");
  return errors;
};

const duplicated = async (lecturerId, body, excludeId) => {
  const items = await LecturerAvailability.find({ lecturer_id: lecturerId, is_deleted: false });
  return items.some(
    (item) =>
      String(item._id) !== String(excludeId) &&
      Number(item.day_of_week) === Number(body.day_of_week) &&
      rangesOverlap(item.start_period, item.end_period, body.start_period, body.end_period),
  );
};

export const getAllLecturerAvailabilities = asyncHandler(async (req, res) => {
  const lecturerId = req.params.lecturer_id || req.query.lecturer_id;
  if (lecturerId && !canAccessLecturer(req, lecturerId)) {
    return errorResponse(res, "Không có quyền", ["FORBIDDEN"], 403);
  }
  const filter = { is_deleted: false };
  if (lecturerId) filter.lecturer_id = lecturerId;
  const items = await LecturerAvailability.find(filter).sort({ day_of_week: 1, start_period: 1 });
  return successResponse(res, items);
});

export const createLecturerAvailability = asyncHandler(async (req, res) => {
  const lecturerId = req.params.lecturer_id || req.body.lecturer_id;
  if (!canAccessLecturer(req, lecturerId)) return errorResponse(res, "Không có quyền", ["FORBIDDEN"], 403);
  const lecturer = await Lecturer.exists({ _id: lecturerId, is_deleted: false });
  if (!lecturer) return errorResponse(res, "Giảng viên không tồn tại", ["LECTURER_NOT_FOUND"], 404);
  const errors = validate(req.body);
  if (await duplicated(lecturerId, req.body)) errors.push("AVAILABILITY_OVERLAP");
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);
  const item = await LecturerAvailability.create({
    lecturer_id: lecturerId,
    day_of_week: req.body.day_of_week,
    start_period: req.body.start_period,
    end_period: req.body.end_period,
    status: normalizeCode(req.body.status),
  });
  return successResponse(res, item, "Tạo lịch bận/rảnh thành công", 201);
});

export const updateLecturerAvailability = asyncHandler(async (req, res) => {
  const existing = await LecturerAvailability.findOne({ _id: req.params.id, is_deleted: false });
  if (!existing) return errorResponse(res, "Lịch bận/rảnh không tồn tại", ["AVAILABILITY_NOT_FOUND"], 404);
  if (!canAccessLecturer(req, existing.lecturer_id)) return errorResponse(res, "Không có quyền", ["FORBIDDEN"], 403);
  const next = { ...existing.toObject(), ...req.body };
  const errors = validate(next);
  if (await duplicated(existing.lecturer_id, next, existing._id)) errors.push("AVAILABILITY_OVERLAP");
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);
  Object.assign(existing, req.body, { status: normalizeCode(next.status) });
  await existing.save();
  return successResponse(res, existing);
});

export const deleteLecturerAvailability = asyncHandler(async (req, res) => {
  const item = await LecturerAvailability.findOne({ _id: req.params.id, is_deleted: false });
  if (!item) return errorResponse(res, "Lịch bận/rảnh không tồn tại", ["AVAILABILITY_NOT_FOUND"], 404);
  if (!canAccessLecturer(req, item.lecturer_id)) return errorResponse(res, "Không có quyền", ["FORBIDDEN"], 403);
  item.is_deleted = true;
  await item.save();
  return successResponse(res, item, "Lịch bận/rảnh đã được xóa");
});
