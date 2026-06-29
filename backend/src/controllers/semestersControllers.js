import Semester from "../models/Semester.js";
import { asyncHandler, errorResponse, successResponse } from "../utils/apiResponse.js";

const validateSemesterDates = (start_date, end_date, isCreate = false) => {
  if (!start_date || !end_date) return "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc";
  const start = new Date(start_date);
  const end = new Date(end_date);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Ngày tháng không hợp lệ";
  if (start >= end) return "Ngày kết thúc học kỳ phải sau ngày bắt đầu";
  if (isCreate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (end < today) return "Không thể tạo học kỳ có ngày kết thúc nằm trong quá khứ";
  }
  return null;
};

export const getAllSemesters = asyncHandler(async (_req, res) => {
  const all = await Semester.find({ is_deleted: false });
  let planningCount = 0;
  for (const s of all) {
    if (s.start_date && s.end_date && new Date(s.start_date) >= new Date(s.end_date)) {
      s.is_deleted = true;
      await s.save();
      continue;
    }
    if (!s.status) {
      if (s.end_date && new Date(s.end_date) < new Date()) {
        s.status = "COMPLETED";
      } else {
        s.status = "PLANNING";
      }
      await s.save();
    }
    if (s.status === "PLANNING") {
      planningCount++;
      if (planningCount > 1) {
        s.status = "UPCOMING";
        await s.save();
      }
    }
  }
  const semesters = await Semester.find({ is_deleted: false }).sort({ createdAt: "desc" });
  return successResponse(res, semesters);
});

export const createSemester = asyncHandler(async (req, res) => {
  const { name, start_date, end_date, status } = req.body;
  if (!name || !name.trim()) return errorResponse(res, "Tên học kỳ không được để trống", ["NAME_REQUIRED"], 400);
  const dateError = validateSemesterDates(start_date, end_date, true);
  if (dateError) return errorResponse(res, dateError, ["DATE_INVALID"], 400);

  const finalStatus = status || "PLANNING";
  if (finalStatus === "PLANNING") {
    await Semester.updateMany({ status: "PLANNING", is_deleted: false }, { $set: { status: "UPCOMING" } });
  }

  const semester = await Semester.create({ name: name.trim(), start_date, end_date, status: finalStatus });
  return successResponse(res, semester, "Tạo học kỳ thành công", 201);
});

export const updateSemester = asyncHandler(async (req, res) => {
  const existing = await Semester.findOne({ _id: req.params.id, is_deleted: false });
  if (!existing) return errorResponse(res, "Học kỳ không tồn tại", ["SEMESTER_NOT_FOUND"], 404);

  const name = req.body.name !== undefined ? req.body.name : existing.name;
  const start_date = req.body.start_date !== undefined ? req.body.start_date : existing.start_date;
  const end_date = req.body.end_date !== undefined ? req.body.end_date : existing.end_date;
  const status = req.body.status !== undefined ? req.body.status : existing.status;

  if (!name || !name.trim()) return errorResponse(res, "Tên học kỳ không được để trống", ["NAME_REQUIRED"], 400);
  const dateError = validateSemesterDates(start_date, end_date, false);
  if (dateError) return errorResponse(res, dateError, ["DATE_INVALID"], 400);

  if (status === "PLANNING" && existing.status !== "PLANNING") {
    await Semester.updateMany({ _id: { $ne: req.params.id }, status: "PLANNING", is_deleted: false }, { $set: { status: "UPCOMING" } });
  }

  const semester = await Semester.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { name: name.trim(), start_date, end_date, status },
    { new: true },
  );
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
