import Semester from "../models/Semester.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";

export const getAllSemesters = asyncHandler(async (_req, res) => {
  const semesters = await Semester.find({ is_deleted: false }).sort({ createdAt: "desc" });
  return successResponse(res, semesters);
});

export const createSemester = asyncHandler(async (req, res) => {
  const { name, start_date, end_date } = req.body;
  if (!name) return errorResponse(res, "Dữ liệu không hợp lệ", ["NAME_REQUIRED"], 400);
  const semester = await Semester.create({ name, start_date, end_date });
  return successResponse(res, semester, "Tạo học kỳ thành công", 201);
});

export const updateSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    req.body,
    { new: true },
  );
  if (!semester) return errorResponse(res, "Học kỳ không tồn tại", ["SEMESTER_NOT_FOUND"], 404);
  return successResponse(res, semester);
});

export const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true },
  );
  if (!semester) return errorResponse(res, "Học kỳ không tồn tại", ["SEMESTER_NOT_FOUND"], 404);
  return successResponse(res, semester, "Học kỳ đã được xóa");
});
