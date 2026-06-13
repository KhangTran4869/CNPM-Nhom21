import { api } from "./api";

export const lecturerService = {
  getLecturers: (params) => api.get("/lecturers", params),
  createLecturer: (data) => api.post("/lecturers", data),
  updateLecturer: (id, data) => api.put(`/lecturers/${id}`, data),
  updateMaxHours: (id, data) => api.patch(`/lecturers/${id}/max-hours`, data),
  updateStatus: (id, data) => api.patch(`/lecturers/${id}/status`, data),
  deleteLecturer: (id) => api.delete(`/lecturers/${id}`),
  getAvailability: (lecturerId) => api.get(`/lecturers/${lecturerId}/availability`),
  createAvailability: (lecturerId, data) =>
    api.post(`/lecturers/${lecturerId}/availability`, data),
  updateAvailability: (id, data) => api.put(`/availability/${id}`, data),
  deleteAvailability: (id) => api.delete(`/availability/${id}`),
  getWorkload: (lecturerId, params) =>
    api.get(`/lecturers/${lecturerId}/workload`, params),
  getTeachingSchedule: (lecturerId, params) =>
    api.get(`/lecturers/${lecturerId}/teaching-schedule`, params),
};
