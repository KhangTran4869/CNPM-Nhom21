import Room from "../models/Room.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";

export const getAllRooms = asyncHandler(async (_req, res) => {
  const rooms = await Room.find({ is_deleted: false }).sort({ createdAt: "desc" });
  return successResponse(res, rooms);
});

export const createRoom = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;
  if (!name) return errorResponse(res, "Dữ liệu không hợp lệ", ["NAME_REQUIRED"], 400);
  const room = await Room.create({ name, capacity });
  return successResponse(res, room, "Tạo phòng học thành công", 201);
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    req.body,
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
