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
) => {
  const normalizedErrors = Array.isArray(errors) ? errors : [errors];
  const firstError = normalizedErrors[0];
  const error =
    typeof firstError === "string"
      ? firstError
      : firstError?.rule || firstError?.message || "ERROR";
  return res.status(statusCode).json({
    success: false,
    error,
    message,
    errors: normalizedErrors,
  });
};

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
