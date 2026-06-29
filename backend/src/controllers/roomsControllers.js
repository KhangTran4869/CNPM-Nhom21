import Room from "../models/Room.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";

export const getAllRooms = asyncHandler(async (_req, res) => {
  await Room.updateMany({ capacity: { $lte: 0 }, is_deleted: false }, { capacity: 50 });
  const rooms = await Room.find({ is_deleted: false }).sort({ createdAt: "desc" });
  return successResponse(res, rooms);
});

export const createRoom = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;
  if (!name || !name.trim()) return errorResponse(res, "Tên phòng không được để trống", ["NAME_REQUIRED"], 400);
  if (capacity === undefined || capacity === null || isNaN(capacity) || Number(capacity) <= 0) {
    return errorResponse(res, "Sức chứa phòng học phải là số dương lớn hơn 0", ["CAPACITY_INVALID"], 400);
  }
  const room = await Room.create({ name: name.trim(), capacity: Number(capacity) });
  return successResponse(res, room, "Tạo phòng học thành công", 201);
});

export const updateRoom = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;
  if (name !== undefined && (!name || !name.trim())) {
    return errorResponse(res, "Tên phòng không được để trống", ["NAME_REQUIRED"], 400);
  }
  if (capacity !== undefined && (capacity === null || isNaN(capacity) || Number(capacity) <= 0)) {
    return errorResponse(res, "Sức chứa phòng học phải là số dương lớn hơn 0", ["CAPACITY_INVALID"], 400);
  }
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (capacity !== undefined) updateData.capacity = Number(capacity);

  const room = await Room.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    updateData,
    { new: true },
  );
  if (!room) return errorResponse(res, "Phòng không tồn tại", ["ROOM_NOT_FOUND"], 404);
  return successResponse(res, room);
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true },
  );
  if (!room) return errorResponse(res, "Phòng không tồn tại", ["ROOM_NOT_FOUND"], 404);
  return successResponse(res, room, "Phòng đã được xóa");
});
