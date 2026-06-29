import Course from "../models/Course.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";

export const getAllCourses = asyncHandler(async (_req, res) => {
  await Course.updateMany({ credits: { $lte: 0 }, is_deleted: false }, { credits: 3 });
  const courses = await Course.find({ is_deleted: false }).populate("department_id").sort({ createdAt: "desc" });
  return successResponse(res, courses);
});

export const createCourse = asyncHandler(async (req, res) => {
  const { code, name, credits, department_id } = req.body;
  if (!code || !code.trim() || !name || !name.trim()) {
    return errorResponse(res, "Mã và tên môn học không được để trống", ["CODE_NAME_REQUIRED"], 400);
  }
  if (credits === undefined || credits === null || isNaN(credits) || Number(credits) <= 0) {
    return errorResponse(res, "Số tín chỉ phải là số dương lớn hơn 0", ["CREDITS_INVALID"], 400);
  }
  const course = await Course.create({ code: code.trim(), name: name.trim(), credits: Number(credits), department_id });
  return successResponse(res, course, "Tạo môn học thành công", 201);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { code, name, credits, department_id } = req.body;
  if ((code !== undefined && (!code || !code.trim())) || (name !== undefined && (!name || !name.trim()))) {
    return errorResponse(res, "Mã và tên môn học không được để trống", ["CODE_NAME_REQUIRED"], 400);
  }
  if (credits !== undefined && (credits === null || isNaN(credits) || Number(credits) <= 0)) {
    return errorResponse(res, "Số tín chỉ phải là số dương lớn hơn 0", ["CREDITS_INVALID"], 400);
  }
  const updateData = {};
  if (code !== undefined) updateData.code = code.trim();
  if (name !== undefined) updateData.name = name.trim();
  if (credits !== undefined) updateData.credits = Number(credits);
  if (department_id !== undefined) updateData.department_id = department_id;

  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    updateData,
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
