import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import type {
  LoginResponse,
  Device,
  DevicesResponse,
  DeviceStats,
  Admin,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
  verify: async (): Promise<{ admin: Admin; valid: boolean }> => {
    const { data } = await api.get("/auth/verify");
    return data;
  },
};

export const deviceApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<DevicesResponse> => {
    const { data } = await api.get("/devices", { params });
    return data;
  },
  getById: async (id: string): Promise<{ device: Device }> => {
    const { data } = await api.get(`/device/${id}`);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/device/${id}`);
  },
  getStats: async (): Promise<DeviceStats> => {
    const { data } = await api.get("/devices/stats");
    return data;
  },
  register: async (deviceData: {
    deviceId: string;
    deviceName: string;
    androidVersion?: string;
    appVersion?: string;
  }): Promise<{ device: Device; isNew: boolean }> => {
    const { data } = await api.post("/device/register", deviceData);
    return data;
  },
  heartbeat: async (
    deviceId: string
  ): Promise<{ device: Device }> => {
    const { data } = await api.post("/device/heartbeat", { deviceId });
    return data;
  },
  getSms: async (deviceId: string): Promise<{ sms: any[] }> => {
    const { data } = await api.get(`/devices/${deviceId}/sms`);
    return data;
  },
  getContacts: async (deviceId: string): Promise<{ contacts: any[] }> => {
    const { data } = await api.get(`/devices/${deviceId}/contacts`);
    return data;
  },
  getFiles: async (deviceId: string): Promise<{ files: any[] }> => {
    const { data } = await api.get(`/devices/${deviceId}/files`);
    return data;
  },
};

export default api;
