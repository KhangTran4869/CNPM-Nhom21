import { api, tokenStore } from "./api";

export const authService = {
  async login(credentials) {
    const data = await api.post("/auth/login", credentials);
    tokenStore.set(data.access_token);
    return data;
  },
  getMe: () => api.get("/auth/me"),
  changePassword: (data) => api.post("/auth/change-password", data),
  updateProfile: (data) => api.put("/auth/profile", data),
  logout() {
    tokenStore.clear();
  },
};
