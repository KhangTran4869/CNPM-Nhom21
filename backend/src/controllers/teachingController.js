import Assignment from "../models/Assignment.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { normalizeCode } from "../utils/constants.js";

const scheduleForLecturer = async (lecturerId, query = {}) => {
  const filter = { lecturer_id: lecturerId, is_deleted: false };
  if (query.status) filter.status = normalizeCode(query.status);
  const assignments = await Assignment.find(filter)
    .populate({
      path: "class_id",
      populate: [
        { path: "course_id", populate: "department_id" },
        { path: "semester_id" },
      ],
    })
    .populate("lecturer_id")
    .sort({ createdAt: "desc" });

  return assignments.filter(
    (item) =>
      !query.semester_id ||
      String(item.class_id?.semester_id?._id || item.class_id?.semester_id) === String(query.semester_id),
  );
};

export const getMyTeachingSchedule = asyncHandler(async (req, res) => {
  if (!req.lecturer) return errorResponse(res, "Giảng viên không tồn tại", ["LECTURER_NOT_FOUND"], 404);
  const data = await scheduleForLecturer(req.lecturer._id, req.query);
  return successResponse(res, data);
});

export const getLecturerTeachingSchedule = asyncHandler(async (req, res) => {
  const data = await scheduleForLecturer(req.params.lecturer_id, req.query);
  return successResponse(res, data);
});
