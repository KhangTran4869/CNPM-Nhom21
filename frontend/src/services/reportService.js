import { api } from "./api";

export const reportService = {
  getAssignmentReport: (params) => api.get("/reports/assignments", params),
  getAssignmentSummary: (params) => api.get("/reports/assignments/summary", params),
  exportAssignmentReport: (params) =>
    api.get("/reports/assignments/export", params),
  getLecturerWorkloads: (params) =>
    api.get("/reports/lecturer-workloads", params),
  exportLecturerWorkloads: (params) =>
    api.get("/reports/lecturer-workloads/export", params),
};
