export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "N/A";

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "N/A";

export const toDateInput = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export const errorText = (err, fallback = "Thao tác không thành công") =>
  err?.payload?.errors
    ?.map((item) => item.message || item.rule || item)
    .join(", ") ||
  err?.message ||
  fallback;
