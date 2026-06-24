import { api } from "./api";

export const classService = {
  getClasses: (params) => api.get("/classes", params),
  createClass: (data) => api.post("/classes", data),
  updateClass: (id, data) => api.put(`/classes/${id}`, data),
  updateClassStatus: (id, data) => api.patch(`/classes/${id}/status`, data),
  getClassSchedules: (classId) => api.get(`/classes/${classId}/schedules`),
  createClassSchedule: (classId, data) =>
    api.post(`/classes/${classId}/schedules`, data),
  getSuggestedLecturers: (classId) =>
    api.get(`/classes/${classId}/suggest-lecturers`),
};
