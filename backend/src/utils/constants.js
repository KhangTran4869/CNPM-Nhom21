export const ROLES = {
  ADMIN: "ADMIN",
  HEAD: "HEAD",
  LECTURER: "LECTURER",
};

export const CLASS_STATUSES = [
  "OPEN",
  "ASSIGNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

export const ASSIGNMENT_STATUSES = ["PENDING", "APPROVED", "REJECTED"];
export const LECTURER_STATUSES = ["ACTIVE", "BUSY", "INACTIVE"];
export const AVAILABILITY_STATUSES = ["BUSY", "FREE"];
export const USER_STATUSES = ["ACTIVE", "INACTIVE"];

export const normalizeCode = (value) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export const roleCodeOf = (user) => normalizeCode(user?.role_id?.code || user?.role);
