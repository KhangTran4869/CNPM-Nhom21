import { api } from "./api";

export const catalogService = {
  getDepartments: () => api.get("/departments"),
  getCourses: () => api.get("/courses"),
  getSemesters: () => api.get("/semesters"),
  getRooms: () => api.get("/rooms"),
  getRoles: () => api.get("/roles"),
};
