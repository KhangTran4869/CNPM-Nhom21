import Department from "../models/Department.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";

export const getAllDepartments = asyncHandler(async (req, res) => {
  const filter = { is_deleted: false };
  if (req.userRole === "HEAD" && req.userFaculty) {
    filter.description = req.userFaculty;
  }
  const departments = await Department.find(filter).sort({ createdAt: "desc" });
  return successResponse(res, departments);
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { code, name, description } = req.body;
  if (!code || !name) return errorResponse(res, "Dữ liệu không hợp lệ", ["CODE_NAME_REQUIRED"], 400);
  const department = await Department.create({ code, name, description });
  return successResponse(res, department, "Tạo bộ môn thành công", 201);
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    req.body,
    { new: true },
  );
  if (!department) return errorResponse(res, "Bộ môn không tồn tại", ["DEPARTMENT_NOT_FOUND"], 404);
  return successResponse(res, department);
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true },
  );
  if (!department) return errorResponse(res, "Bộ môn không tồn tại", ["DEPARTMENT_NOT_FOUND"], 404);
  return successResponse(res, department, "Bộ môn đã được xóa");
});
