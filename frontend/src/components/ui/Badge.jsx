const toneByStatus = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  ACTIVE: "success",
  OPEN: "info",
  ASSIGNED: "success",
  BUSY: "warning",
  FREE: "info",
  OVERLOAD: "warning",
  NORMAL: "success",
  UNDERLOAD: "danger",
  "Thiếu giờ": "danger",
  "Đủ giờ": "success",
  "Đủ tải": "success",
  "Vượt tải": "warning",
  ADMIN: "danger",
  HEAD: "warning",
  LECTURER: "info",
};

export function Badge({ children, variant }) {
  const tone = variant || toneByStatus[children] || "info";
  return <span className={`status-badge ${tone}`}>{children || "N/A"}</span>;
}
