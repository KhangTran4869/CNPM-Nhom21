import Course from "../models/Course.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";

export const getAllCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find({ is_deleted: false }).populate("department_id").sort({ createdAt: "desc" });
  return successResponse(res, courses);
});

export const createCourse = asyncHandler(async (req, res) => {
  const { code, name, credits, department_id } = req.body;
  if (!code || !name) return errorResponse(res, "Dữ liệu không hợp lệ", ["CODE_NAME_REQUIRED"], 400);
  const course = await Course.create({ code, name, credits, department_id });
  return successResponse(res, course, "Tạo môn học thành công", 201);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    req.body,
    { new: true },
  );
  if (!course) return errorResponse(res, "Môn học không tồn tại", ["COURSE_NOT_FOUND"], 404);
  return successResponse(res, course);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true },
  );
  if (!course) return errorResponse(res, "Môn học không tồn tại", ["COURSE_NOT_FOUND"], 404);
  return successResponse(res, course, "Môn học đã được xóa");
});
