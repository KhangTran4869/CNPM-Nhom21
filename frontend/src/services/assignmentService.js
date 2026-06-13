import { api } from "./api";

export const assignmentService = {
  getAssignments: (params) => api.get("/assignments", params),
  proposeAssignment: (data) => api.post("/assignments/propose", data),
  createAssignment: (data) => api.post("/assignments", data),
  approveAssignment: (id, data) => api.patch(`/assignments/${id}/approve`, data),
  rejectAssignment: (id, data) => api.patch(`/assignments/${id}/reject`, data),
  changeLecturer: (id, data) =>
    api.patch(`/assignments/${id}/change-lecturer`, data),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  checkAssignment: (data) => api.post("/assignments/check", data),
};
