import Role from "../models/Role.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { normalizeCode } from "../utils/constants.js";

export const getAllRoles = asyncHandler(async (_req, res) => {
  const roles = await Role.find({ is_deleted: false }).sort({ createdAt: "desc" });
  return successResponse(res, roles);
});

export const createRole = asyncHandler(async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) {
    return errorResponse(res, "Dữ liệu không hợp lệ", ["CODE_NAME_REQUIRED"], 400);
  }
  const role = await Role.create({ code: normalizeCode(code), name });
  return successResponse(res, role, "Tạo vai trò thành công", 201);
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { ...req.body, code: req.body.code ? normalizeCode(req.body.code) : undefined },
    { new: true },
  );
  if (!role) return errorResponse(res, "Vai trò không tồn tại", ["ROLE_NOT_FOUND"], 404);
  return successResponse(res, role);
});

export const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true },
  );
  if (!role) return errorResponse(res, "Vai trò không tồn tại", ["ROLE_NOT_FOUND"], 404);
  return successResponse(res, role, "Vai trò đã được xóa");
});
