export const successResponse = (
  res,
  data = {},
  message = "Thao tác thành công",
  statusCode = 200,
) => res.status(statusCode).json({ success: true, message, data });

export const errorResponse = (
  res,
  message = "Dữ liệu không hợp lệ",
  errors = [],
  statusCode = 400,
) => res.status(statusCode).json({ success: false, message, errors });

export class ApiError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [errors];
  }
}

export const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};
