import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token if available
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem("adminAuth");
  if (auth) {
    config.headers.Authorization = `Basic ${auth}`;
  }
  return config;
});

export const apiClient = {
  // Home page data
  getHome: () => api.get("/home"),
  getSpeakers: () => api.get("/speakers"),
  getEvents: () => api.get("/events"),
  getSponsors: () => api.get("/sponsors"),

  // Registration
  submitRegistration: (formData: FormData) =>
    api.post("/registrations", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Admin operations
  login: (username: string, password: string) => {
    const encoded = btoa(`${username}:${password}`);
    localStorage.setItem("adminAuth", encoded);
    return Promise.resolve({ data: { success: true } });
  },

  logout: () => {
    localStorage.removeItem("adminAuth");
    return Promise.resolve({ data: { success: true } });
  },

  // Banner
  createBanner: (data: FormData) =>
    api.post("/admin/banner", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Speakers
  createSpeaker: (data: FormData) =>
    api.post("/admin/speakers", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateSpeaker: (id: string, data: FormData) =>
    api.put(`/admin/speakers/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteSpeaker: (id: string) => api.delete(`/admin/speakers/${id}`),

  // Events
  createEvent: (data: FormData) =>
    api.post("/admin/events", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateEvent: (id: string, data: FormData) =>
    api.put(`/admin/events/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteEvent: (id: string) => api.delete(`/admin/events/${id}`),

  // Sponsors
  createSponsor: (data: FormData) =>
    api.post("/admin/sponsors", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateSponsor: (id: string, data: FormData) =>
    api.put(`/admin/sponsors/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteSponsor: (id: string) => api.delete(`/admin/sponsors/${id}`),

  // Registrations
  getRegistrations: (filters?: any) =>
    api.get("/admin/registrations", { params: filters }),
  updateRegistration: (id: string, status: string) =>
    api.put(`/admin/registrations/${id}`, { status }),
};

export default api;
