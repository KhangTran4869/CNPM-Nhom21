const toneByStatus = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  ACTIVE: "success",
  OPEN: "info",
  ASSIGNED: "success",
  BUSY: "warning",
  FREE: "info",
  OVERLOAD: "danger",
  NORMAL: "success",
};

export function Badge({ children }) {
  const tone = toneByStatus[children] || "info";
  return <span className={`status-badge ${tone}`}>{children || "N/A"}</span>;
}
