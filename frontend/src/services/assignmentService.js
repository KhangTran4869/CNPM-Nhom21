import { api } from "./api";

export const assignmentService = {
  getAssignments: (params) => api.get("/assignments", params),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  proposeAssignment: (data) => api.post("/assignments/propose", data),
  createAssignment: (data) => api.post("/assignments", data),
  updateAssignment: (id, data = {}) => api.put(`/assignments/${id}`, data),
  approveAssignment: (id, data = {}) => api.patch(`/assignments/${id}/approve`, data),
  rejectAssignment: (id, data = {}) => api.patch(`/assignments/${id}/reject`, data),
  changeLecturer: (id, data = {}) =>
    api.patch(`/assignments/${id}/change-lecturer`, data),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  checkAssignment: (data = {}) => api.post("/assignments/check", data),
  autoAssign: (data = {}) => api.post("/assignments/auto-assign", data),
  getAssignmentHistory: (id) => api.get(`/assignments/${id}/history`),
  getAllAssignmentHistory: () => api.get("/assignment-history"),
  deleteAssignmentHistory: (id) => api.delete(`/assignment-history/${id}`),
};
