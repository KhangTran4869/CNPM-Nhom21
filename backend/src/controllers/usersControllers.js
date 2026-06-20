import User from "../models/User.js";
import Role from "../models/Role.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";
import { normalizeCode, USER_STATUSES } from "../utils/constants.js";
import { hashPassword } from "../utils/password.js";

const buildUserQuery = (query) => {
  const filter = { is_deleted: false };
  if (query.status) filter.status = normalizeCode(query.status);
  if (query.keyword) filter.username = { $regex: query.keyword, $options: "i" };
  if (query.role) filter.role_id = query.role;
  return filter;
};

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const users = await User.find(buildUserQuery(req.query))
    .populate("role_id")
    .sort({ createdAt: "desc" })
    .skip((page - 1) * limit)
    .limit(limit);
  return successResponse(res, users);
});

export const createUser = asyncHandler(async (req, res) => {
  const { username, password, role_id, status = "ACTIVE" } = req.body;
  const errors = [];
  if (!username) errors.push("USERNAME_REQUIRED");
  if (!password || password.length < 6) errors.push("PASSWORD_MIN_6");
  if (!USER_STATUSES.includes(normalizeCode(status))) errors.push("INVALID_STATUS");
  if (await User.exists({ username, is_deleted: false })) errors.push("USERNAME_EXISTS");
  if (!(await Role.exists({ _id: role_id, is_deleted: false }))) errors.push("ROLE_NOT_FOUND");
  if (errors.length) return errorResponse(res, "Dữ liệu không hợp lệ", errors, 400);

  const password_hash = await hashPassword(password);
  const user = await User.create({
    username,
    password_hash,
    role_id,
    status: normalizeCode(status),
  });
  return successResponse(res, user, "Tạo người dùng thành công", 201);
});

export const updateUser = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.role_id) {
    if (!(await Role.exists({ _id: req.body.role_id, is_deleted: false }))) {
      return errorResponse(res, "Dữ liệu không hợp lệ", ["ROLE_NOT_FOUND"], 400);
    }
    updates.role_id = req.body.role_id;
  }
  if (req.body.status) {
    const status = normalizeCode(req.body.status);
    if (!USER_STATUSES.includes(status)) {
      return errorResponse(res, "Dữ liệu không hợp lệ", ["INVALID_STATUS"], 400);
    }
    updates.status = status;
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    updates,
    { new: true },
  ).populate("role_id");
  if (!user) return errorResponse(res, "Người dùng không tồn tại", ["USER_NOT_FOUND"], 404);
  return successResponse(res, user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true },
  );
  if (!user) return errorResponse(res, "Người dùng không tồn tại", ["USER_NOT_FOUND"], 404);
  return successResponse(res, user, "Người dùng đã được xóa");
});
