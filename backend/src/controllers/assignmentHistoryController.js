import AssignmentHistory from "../models/AssignmentHistory.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";

export const getAllAssignmentsHistory = asyncHandler(async (req, res) => {
  const filter = { is_deleted: false };
  const assignmentId = req.params.assignment_id || req.query.assignment_id;
  if (assignmentId) filter.assignment_id = assignmentId;
  const history = await AssignmentHistory.find(filter)
    .populate({
      path: "assignment_id",
      populate: {
        path: "class_id",
        populate: [{ path: "course_id" }, { path: "semester_id" }],
      },
    })
    .populate("old_lecturer_id new_lecturer_id changed_by")
    .sort({ changed_at: "desc" });
  return successResponse(res, history);
});

export const createAssignmentHistory = asyncHandler(async (req, res) => {
  const history = await AssignmentHistory.create(req.body);
  return successResponse(res, history, "Tạo lịch sử phân công thành công", 201);
});

export const updateAssignmentHistory = asyncHandler(async (req, res) => {
  const history = await AssignmentHistory.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    req.body,
    { new: true },
  );
  if (!history) return errorResponse(res, "Lịch sử phân công không tồn tại", ["HISTORY_NOT_FOUND"], 404);
  return successResponse(res, history);
});

export const deleteAssignmentHistory = asyncHandler(async (req, res) => {
  const history = await AssignmentHistory.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true },
    { new: true },
  );
  if (!history) return errorResponse(res, "Lịch sử phân công không tồn tại", ["HISTORY_NOT_FOUND"], 404);
  return successResponse(res, history, "Lịch sử phân công đã được xóa");
});
